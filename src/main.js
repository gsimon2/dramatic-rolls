import soundEffectController from './soundEffectController.js';

const mod = 'dramatic-rolls';
let diceSoNiceActive = false;
let pendingDiceSoNiceRolls = new Map();

Hooks.on('init', () => {
    game.settings.register(mod, 'add-sound', {
        name: 'Add sound effect to natural twenties',
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

Hooks.on('createChatMessage', (msg) => {
    let roll = msg._roll;
    if (roll) {
        roll = game.settings.get(mod, 'add-sound') ? attachSoundEffectIfNeeded(roll) : roll;

        if (diceSoNiceActive) {
            pendingDiceSoNiceRolls.set(msg.id, roll);
        } else {
            playSound(roll);
        }
    }
});

Hooks.on('diceSoNiceRollComplete', (msgId) => {
    const roll = pendingDiceSoNiceRolls.get(msgId);
    playSound(roll);
    pendingDiceSoNiceRolls.delete(msgId);
});

const attachSoundEffectIfNeeded = (roll) => {
    if (roll._formula.includes('1d20')) {
        if (roll.results[0] == 20) {
            mergeObject(roll, {soundEffect: soundEffectController.getCritSoundEffect()});
        } else if (roll.results[0] == 1) {
            mergeObject(roll, {soundEffect: soundEffectController.getFumbleSoundEffect()});
        }
    }

    return roll;
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


