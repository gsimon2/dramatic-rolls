import {mod} from './main.js';

export const registerSettings = () => {
    game.settings.register(mod, 'add-sound', {
        name: 'dramatic-rolls.settings.add-sound-name',
        hint: 'dramatic-rolls.settings.add-sound-label',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
};

export const registerConfettiSetting = () => {
    game.settings.register(mod, 'add-confetti', {
        name: 'dramatic-rolls.settings.add-confetti-name',
        // hint: '',
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
    });
};