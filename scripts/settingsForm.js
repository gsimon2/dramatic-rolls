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

    storedSettings = {};

    getData(options) {
        const nonSettingData = {
            acceptedSoundFormats: "audio/mpeg,audio/ogg,audio/x-flac,audio/flac,audio/wav,audio/webm",
        };

        if ($.isEmptyObject(this.storedSettings)) {
            this.storedSettings = game.settings.get(constants.modName, 'settings');
        }

        console.log(this.storedSettings, defaultSettings)

        const data = mergeObject(nonSettingData, this.reset ? defaultSettings : this.storedSettings);
        this.data = data;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="reset"]').click(this.onReset.bind(this));
        html.find('button[id="add-crit-sound-button"]').click(((e) => this.simulateCritInputClick(e)).bind(this));
        html.find('button[id="add-fumble-sound-button"]').click(((e) => this.simulateFumbleInputClick(e)).bind(this));
        this.bindPlaySoundButtons(html);
        this.bindRemoveSoundButtons(html);
        this.reset = false;
    }

    simulateCritInputClick(e) {
        e.preventDefault();
        e.stopPropagation();
        new FilePicker({
            type: "audio",
            displayMode: "list",
            canUpload: "true",
            callback: path => this.onAddCrit(path)
        }).render();
    }

    simulateFumbleInputClick(e) {
        e.preventDefault();
        e.stopPropagation();
        new FilePicker({
            type: "audio",
            displayMode: "list",
            canUpload: "true",
            callback: path => this.onAddFumble(path)
        }).render();
    }

    bindPlaySoundButtons(html) {
        this.data.critSounds.forEach((soundObject, index) => {
            html.find(`button[id="play-crit-sound-${index}`).click(((e) => this.onPlaySound(e, soundObject.path)).bind(this));
        });
        this.data.fumbleSounds.forEach((soundObject, index) => {
            html.find(`button[id="play-fumble-sound-${index}`).click(((e) => this.onPlaySound(e, soundObject.path)).bind(this));
        });
    }

    bindRemoveSoundButtons(html) {
        this.data.critSounds.forEach((soundObject, index) => {
            if (soundObject.isUserAddedSound) {
                html.find(`button[id="delete-crit-sound-${index}`).click(((e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.updateStoredSettingsFromForm();
                    this.storedSettings.critSounds.splice(index, 1);
                    this.render();
                }).bind(this));
            }
        });

        this.data.fumbleSounds.forEach((soundObject, index) => {
            if (soundObject.isUserAddedSound) {
                html.find(`button[id="delete-fumble-sound-${index}`).click(((e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.updateStoredSettingsFromForm();
                    this.storedSettings.fumbleSounds.splice(index, 1);
                    this.render();
                }).bind(this));
            }
        });
    }

    onReset() {
        this.reset = true;
        this.render();
    }

    onAddCrit(newFilePath) {
        this.updateStoredSettingsFromForm();
        this.storedSettings.critSounds.push({enabled: true, path: newFilePath, isUserAddedSound: true});
        this.render();
        this.scrollToBottom('#crit-sounds-list');
    }

    onAddFumble(newFilePath) {
        this.updateStoredSettingsFromForm()
        this.storedSettings.fumbleSounds.push({enabled: true, path: newFilePath, isUserAddedSound: true});
        this.render();
        this.scrollToBottom('#fumble-sounds-list');
    }

    scrollToBottom(selector) {
        setTimeout(() => {
            $(selector).scrollTop($(selector)[0].scrollHeight);
        }, 100);
    }

    updateStoredSettingsFromForm() {
        const critSoundsEnabled = Array.from($(this.form).find('input[name="critEnabled"]')).map(inputElement => inputElement.checked);
        const critSounds = critSoundsEnabled.map((ce, index) => Object.assign({}, this.storedSettings.critSounds[index], {enabled: ce}));

        const fumbleSoundsEnabled = Array.from($(this.form).find('input[name="fumbleEnabled"]')).map(inputElement => inputElement.checked);
        const fumbleSounds = fumbleSoundsEnabled.map((fe, index) => Object.assign({}, this.storedSettings.fumbleSounds[index], {enabled: fe}));
        
        this.storedSettings = {
            critSounds,
            fumbleSounds
        };
    }

    onPlaySound(e, soundPath) {
        e.preventDefault();
        e.stopPropagation();
        AudioHelper.play({
            src: soundPath,
            volume: 0.8,
            autoplay: true,
            loop: false
        }, false);
    }

    _updateObject(events, formData) {
        const currentSettings = this.storedSettings;
        const critSounds = formData.critEnabled.map((ce, index) => Object.assign({}, currentSettings.critSounds[index], {enabled: ce}));
        const fumbleSounds = formData.fumbleEnabled.map((fe, index) => Object.assign({}, currentSettings.fumbleSounds[index], {enabled: fe}));
        let updatedSettings = {
            critSounds,
            fumbleSounds
        };

        updatedSettings = mergeObject(currentSettings, updatedSettings, {insertKeys: true, insertValues: true});
        game.settings.set(constants.modName, 'settings', updatedSettings);
    }
};


