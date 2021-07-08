import soundEffectController from './soundEffectController.js';
import {registerSettings, registerConfettiSetting} from './settings.js';
import constants from '../constants.js';

let diceSoNiceActive = false;
let pendingDiceSoNiceRolls = new Map();
const pendingQuickRolls = [];

Hooks.on('init', () => {
    registerSettings();
});

Hooks.on('ready', () => {
    if (game.modules.get('dice-so-nice')?.active) {
        diceSoNiceActive = true;

        Hooks.on('diceSoNiceRollComplete', (msgId) => {
            const storedInfo = pendingDiceSoNiceRolls.get(msgId); 
            const roll = storedInfo.roll;
            roll && handleEffects(roll, storedInfo.isPublicRoll);
            pendingDiceSoNiceRolls.delete(msgId);
        });
    }

    if (game.modules.get('quick-rolls')?.active) {
        if (diceSoNiceActive && game.users.get(game.userId).isGM) {
            ui.notifications.warn(`${constants.modName} only offers limited support for quick-rolls and dice-so-nice being used together. On advantage and disadvantage rolls, both die will trigger ${constants.modName} effects.`);
        }

        Hooks.on('updateChatMessage', (msg, obj) => {
            const msgId = msg.data._id;
            if (!diceSoNiceActive && pendingQuickRolls.includes(msgId)) {
                return;
            }

            try {
                pendingQuickRolls.push(msgId);
                const isRoller = msg.user.data._id == game.userId;
                const isPublicRoll = !msg.data.whisper.length;
                const html = $.parseHTML(obj.content)[0];
    
                if (isRoller && html) {
                    const diceRolls = html.querySelectorAll('div.dice-roll');
                    const usedDice = [...diceRolls].filter(node => !node.classList.contains('qr-discarded'))[0];
                    const rollFormula = usedDice.querySelector('div.dice-formula')?.textContent;
                    const rollResult = usedDice.querySelector('li.roll.d20')?.textContent;

                    if (rollFormula && !disableDueToNPC(msg.data.speaker)) {
                        let roll = new Roll(rollFormula);
                        roll.results = [rollResult];
                        handleEffects(roll, isPublicRoll);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    if (game.modules.get('confetti')?.active) {
        registerConfettiSetting();
    }

    if (game.modules.get('midi-qol')?.active) {
        // Handles the midi-qol merge rolls onto one card setting
        Hooks.on('midi-qol.AttackRollComplete', (workflow) => {
            let roll = workflow.attackRoll;
            !disableDueToNPC(workflow.speaker) && handleEffects(roll);
        });
    }
});

Hooks.on('createChatMessage', (msg) => {
    let roll = msg._roll;
    const isRoller = msg.user.data._id == game.userId;
    const isPublicRoll = roll && !msg.data.whisper.length;

    if (roll && isRoller && !disableDueToNPC(msg.data.speaker)) {
        if (diceSoNiceActive) {
            pendingDiceSoNiceRolls.set(msg.id, {roll, isPublicRoll});
        } else {
            handleEffects(roll, isPublicRoll);
        }
    }
});

const disableDueToNPC = (speaker) => {
    const settingEnabld = game.settings.get(constants.modName, 'disable-npc-rolls')
    const actor = ChatMessage.getSpeakerActor(speaker);
    const actorHasPlayerOwner = actor ? actor.hasPlayerOwner : false;
    const isGM = game.users.get(game.userId).isGM;

    return  settingEnabld && (!actorHasPlayerOwner && isGM);
};

const getActiveResults = (roll) => {
    return roll.terms.reduce((acc, term) => acc.concat(term?.results), []).filter(result => result.active).map(result => result.result);
};

const isCrit = (roll) => {
    getActiveResults(roll);
    if (roll._formula.includes('d20')) {
        if (getActiveResults(roll).includes(20) || constants.debugMode) {
            return true;
        }
    }
    return false;
};

const isFumble = (roll) => {
    if (roll._formula.includes('d20')) {
        if (getActiveResults(roll).includes(1)) {
            return true;
        }
    }
    return false;
};

const attachSoundEffectIfNeeded = (roll) => {
    if (isCrit(roll)) {
        mergeObject(roll, {soundEffect: soundEffectController.getCritSoundEffect()});
    }

    if (isFumble(roll)) {
        mergeObject(roll, {soundEffect: soundEffectController.getFumbleSoundEffect()});
    }

    return roll;
};

const handleEffects = (roll, isPublic = true) => {
    roll = game.settings.get(constants.modName, 'add-sound') ? attachSoundEffectIfNeeded(roll) : roll;
    const shouldPlay = isPublic || !game.settings.get(constants.modName, 'trigger-on-public-only');
    const shouldBroadcastToOtherPlayers = isPublic;
    shouldPlay && handleConfetti(roll, shouldBroadcastToOtherPlayers);
    shouldPlay && playSound(roll, shouldBroadcastToOtherPlayers);
};

const playSound = (roll, broadcastSound) => {
    const soundEffect = roll.soundEffect;

    if (soundEffect) {
        AudioHelper.play({
            src: soundEffect,
            volume: 0.8,
            autoplay: true,
            loop: false
        }, broadcastSound);
    }
};

const handleConfetti = (roll, shouldBroadcastToOtherPlayers) => {
    try {
        if (game.settings.get(constants.modName, 'add-confetti') && isCrit(roll)) {
            const strength = window.confetti.confettiStrength.high;
            const shootConfettiProps = window.confetti.getShootConfettiProps(strength);
            mergeObject(shootConfettiProps, {'sound': null});

            if (shouldBroadcastToOtherPlayers) {
                window.confetti.shootConfetti(shootConfettiProps);
            } else {
                window.confetti.handleShootConfetti(shootConfettiProps);
            }
        }
    } catch {
        // Oh well, means the confetti mod isn't installed
    }
};


