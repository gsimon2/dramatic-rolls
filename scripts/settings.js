import constants from '../constants.js';

export const registerSettings = () => {
    game.settings.register(constants.modName, 'add-sound', {
        name: 'dramatic-rolls.settings.add-sound-name',
        hint: 'dramatic-rolls.settings.add-sound-label',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
};

export const registerConfettiSetting = () => {
    game.settings.register(constants.modName, 'add-confetti', {
        name: 'dramatic-rolls.settings.add-confetti-name',
        // hint: '',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
};