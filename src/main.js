import soundEffectController from './soundEffectController.js';

const mod = 'dramatic-rolls';
let diceSoNiceActive = false;
let pendingDiceSoNiceRolls = new Map();
const pendingQuickRolls = [];

Hooks.on('init', () => {
    game.settings.register(mod, 'add-sound', {
        name: 'Add sound effect to natural twenties and natural ones',
        // hint: '',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
});

Hooks.on('ready', () => {
    if (game.modules.get('quick-rolls')?.active) {
        Hooks.on('updateChatMessage', (msg, obj) => {
            const msgId = msg.data._id;
            if (pendingQuickRolls.includes(msgId)) {
                return;
            }

            pendingQuickRolls.push(msgId);
            const isRoller = msg.user.data._id == game.userId;
            const isPublicRoll = !msg.data.whisper.length;
            const html = $.parseHTML(obj.content)[0];

            if (isRoller && isPublicRoll && html) {
                const diceRolls = html.querySelectorAll('div.dice-roll');
                const usedDice = [...diceRolls].filter(node => !node.classList.contains('qr-discarded'))[0];
                const rollFormula = usedDice.querySelector('div.dice-formula')?.textContent;
                const rollResult = usedDice.querySelector('li.roll.d20')?.textContent;

                if (rollFormula) {
                    let roll = new Roll(rollFormula);
                    roll.results = [rollResult];
                    console.log(roll)
                    handleEffects(roll);
                }
            }
        });
    }

    if (game.modules.get('dice-so-nice')?.active) {
        diceSoNiceActive = true;

        Hooks.on('diceSoNiceRollComplete', (msgId) => {
            const roll = pendingDiceSoNiceRolls.get(msgId);
            roll && handleEffects(roll);
            pendingDiceSoNiceRolls.delete(msgId);
        });
    }

    if (game.modules.get('confetti')?.active) {
        game.settings.register(mod, 'add-confetti', {
            name: 'Add confetti to natural twenties',
            // hint: '',
            scope: 'world',
            config: true,
            default: true,
            type: Boolean,
        });
    }

    if (game.modules.get('midi-qol')?.active) {
        // Handles the midi-qol merge rolls onto one card setting
        Hooks.on('midi-qol.AttackRollComplete', (workflow) => {
            let roll = workflow.attackRoll;
            handleEffects(roll);
        });
    }
});

Hooks.on('createChatMessage', (msg) => {
    let roll = msg._roll;
    const isRoller = msg.user.data._id == game.userId;
    const isPublicRoll = roll && !msg.data.whisper.length;

    if (roll && isRoller && isPublicRoll) {
        if (diceSoNiceActive) {
            pendingDiceSoNiceRolls.set(msg.id, roll);
        } else {
            handleEffects(roll);
        }
    }
});

const isCrit = (roll) => {
    if (roll._formula.includes('d20')) {
        if (roll.results[0] > 1) {
            return true;
        }
    }
    return false;
};

const isFumble = (roll) => {
    if (roll._formula.includes('d20')) {
        if (roll.results[0] == 1) {
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

const handleEffects = (roll) => {
    roll = game.settings.get(mod, 'add-sound') ? attachSoundEffectIfNeeded(roll) : roll;
    handleConfetti(roll);
    playSound(roll);
};

const playSound = (roll) => {
    const soundEffect = roll.soundEffect;

    if (soundEffect) {
        AudioHelper.play({
            src: soundEffect,
            volume: 0.8,
            autoplay: true,
            loop: false
        }, true);
    }
};

const handleConfetti = (roll) => {
    try {
        if (game.settings.get(mod, 'add-confetti') && isCrit(roll)) {
            const strength = window.confetti.confettiStrength.high;
            const shootConfettiProps = window.confetti.getShootConfettiProps(strength);
            mergeObject(shootConfettiProps, {'sound': null});
            window.confetti.shootConfetti(shootConfettiProps);
        }
    } catch {
        // Oh well, means the confetti mod isn't installed
    }
};


