import constants from '../constants.js';
import {defaultSettings} from './settings.js';

export class DramaticRollsSettingsForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: game.i18n.localize(`${constants.modName}.settings-form.title`),
            id: `${constants.modName}-settings-form`,
            template: `modules/${constants.modName}/templates/settings-form.handlebars`,
            width: 500,
            closeOnSubmit: true
        });
    }

    getData(options) {
        const staticData = {
        };

        const data = mergeObject(staticData, this.reset ? defaultSettings : game.settings.get(constants.modName, 'settings'));
        this.data = data;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="reset"]').click(this.onReset.bind(this));
        this.bindPlaySoundButtons(html);
        this.reset = false;
    }

    bindPlaySoundButtons(html) {
        this.data.critSounds.forEach((soundObject, index) => {
            html.find(`button[id="play-crit-sound-${index}`).click(((e) => this.onPlaySound(e, soundObject.path)).bind(this));
        });
    }

    onReset() {
        this.reset = true;
        this.render();
    }

    onPlaySound(e, soundPath) {
        e.preventDefault();
        e.stopPropagation();
        AudioHelper.play({
            src: soundPath,
            volume: 0.8,
            autoplay: true,
            loop: false
        }, true);
    }

    _updateObject(events, formData) {
        const currentSettings = game.settings.get(constants.modName, 'settings');
        const critSounds = formData.critEnabled.map((ce, index) => Object.assign({}, currentSettings.critSounds[index], {enabled: ce}));
        let updatedSettings = {
            critSounds
        };

        updatedSettings = mergeObject(currentSettings, updatedSettings, {insertKeys: true, insertValues: true});
        game.settings.set(constants.modName, 'settings', updatedSettings);
    }
};


