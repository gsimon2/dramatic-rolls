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
        console.log(data);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="reset"]').click(this.onReset.bind(this));
        this.reset = false;
    }

    onReset() {
        this.reset = true;
        this.render();
    }

    _updateObject(events, formData) {
        let settings = mergeObject(game.settings.get(constants.modName, 'settings'), formData, {insertKeys: true, insertValues: true});
        console.log(settings);
        // game.settings.set(constants.modName, 'settings', settings);
    }
};