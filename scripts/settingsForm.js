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
        this.bindVolumeSliders(html);
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

    bindVolumeSliders(html) {
        this.data.critSounds.forEach((soundObject, index) => {
            html.find(`input[id="crit-sound-volume-${index}`).change(((e) => this.onVolumeUpdate(e, soundObject)).bind(this));
        });
        this.data.fumbleSounds.forEach((soundObject, index) => {
            html.find(`input[id="fumble-sound-volume-${index}`).change(((e) => this.onVolumeUpdate(e, soundObject)).bind(this));
        });
    }

    bindPlaySoundButtons(html) {
        this.data.critSounds.forEach((soundObject, index) => {
            html.find(`button[id="play-crit-sound-${index}`).click(((e) => this.onPlaySound(e, soundObject)).bind(this));
        });
        this.data.fumbleSounds.forEach((soundObject, index) => {
            html.find(`button[id="play-fumble-sound-${index}`).click(((e) => this.onPlaySound(e, soundObject)).bind(this));
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
        const critSoundsVolumes = Array.from($(this.form).find('input[name="crit-volume"]')).map(inputElement => inputElement.value);
        const critSounds = critSoundsEnabled.map((ce, index) => Object.assign({}, this.storedSettings.critSounds[index], {enabled: ce, volume: critSoundsVolumes[index]}));

        const fumbleSoundsEnabled = Array.from($(this.form).find('input[name="fumbleEnabled"]')).map(inputElement => inputElement.checked);
        const fumbleSoundsVolumes = Array.from($(this.form).find('input[name="fumble-volume"]')).map(inputElement => inputElement.value);
        const fumbleSounds = fumbleSoundsEnabled.map((fe, index) => Object.assign({}, this.storedSettings.fumbleSounds[index], {enabled: fe, volume: fumbleSoundsVolumes[index]}));
        
        this.storedSettings = {
            critSounds,
            fumbleSounds
        };
    }

    onPlaySound(e, soundObject) {
        e.preventDefault();
        e.stopPropagation();
        AudioHelper.play({
            src: soundObject.path,
            volume: soundObject.volume,
            autoplay: true,
            loop: false
        }, false);
    }

    onVolumeUpdate(e, soundObject) {
        soundObject.volume = Number(e.currentTarget.value);
        this.updateStoredSettingsFromForm();
        this.render();
    }

    _updateObject(events, formData) {
        const currentSettings = this.storedSettings;
        console.log(currentSettings)
        const critSounds = formData.critEnabled.map((ce, index) => Object.assign({}, currentSettings.critSounds[index], {enabled: ce}));
        const fumbleSounds = formData.fumbleEnabled.map((fe, index) => Object.assign({}, currentSettings.fumbleSounds[index], {enabled: fe}));
        let updatedSettings = {
            critSounds,
            fumbleSounds
        };

        updatedSettings = mergeObject(currentSettings, updatedSettings, {insertKeys: true, insertValues: true});
        console.log(updatedSettings)
        game.settings.set(constants.modName, 'settings', updatedSettings);
    }

    _onSubmit(event, updateData) {
        console.log("submit");
    }
};


