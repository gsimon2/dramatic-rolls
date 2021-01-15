import soundEffectController from './soundEffectController.js';

const mod = 'dramatic-rolls';
let diceSoNiceActive = false;
let foundryVttConfettiActive = false;
let pendingDiceSoNiceRolls = new Map();

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

Hooks.on('diceSoNiceInit', () => {
    diceSoNiceActive = true;
});

Hooks.on('confettiReady', () => {
    foundryVttConfettiActive = true;

    game.settings.register(mod, 'add-confetti', {
        name: 'Add confetti to natural twenties',
        // hint: '',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
});

Hooks.on('createChatMessage', (msg) => {
    let roll = msg._roll;

    if (roll && msg.user.data._id == game.userId) {
        roll = game.settings.get(mod, 'add-sound') ? attachSoundEffectIfNeeded(roll) : roll;

        if (diceSoNiceActive) {
            pendingDiceSoNiceRolls.set(msg.id, roll);
        } else {
            handleEffects(roll);
        }
    }
});

Hooks.on('diceSoNiceRollComplete', (msgId) => {
    const roll = pendingDiceSoNiceRolls.get(msgId);
    handleEffects(roll);
    pendingDiceSoNiceRolls.delete(msgId);
});

const isCrit = (roll) => {
    if (roll._formula.includes('1d20')) {
        if (roll.results[0] == 20) {
            return true;
        }
    }
    return false;
};

const isFumble = (roll) => {
    if (roll._formula.includes('1d20')) {
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
}


