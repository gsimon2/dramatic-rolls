import constants from "../../constants.js";
import soundEffectController from "../controllers/soundEffectController.js";
import { defaultSettings } from "./settings.js";

export class ConfigureSoundSettingsForm extends FormApplication {
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: game.i18n.localize(`${constants.modName}.configure-sounds-settings-form.title`),
         id: `${constants.modName}-configure-sounds-settings-form`,
         template: `modules/${constants.modName}/templates/sound-settings-form.handlebars`,
         width: 500,
         closeOnSubmit: true,
         scrollY: ["#crit-sounds-list", "#fumble-sounds-list"],
      });
   }

   storedSettings = {};

   getData(options) {
      const nonSettingData = {
         acceptedSoundFormats:
            "audio/mpeg,audio/ogg,audio/x-flac,audio/flac,audio/wav,audio/webm",
      };

      if ($.isEmptyObject(this.storedSettings)) {
         this.storedSettings = game.settings.get(constants.modName, "settings");
      }

      const data = foundry.utils.mergeObject(nonSettingData, this.storedSettings);

      this.data = data;
      return data;
   }

   activateListeners(html) {
      super.activateListeners(html);
      html.find('button[name="reset"]').click(this.onReset.bind(this));
      html
         .find('button[id="add-crit-sound-button"]')
         .click(((e) => this.simulateCritInputClick(e)).bind(this));
      html
         .find('button[id="add-fumble-sound-button"]')
         .click(((e) => this.simulateFumbleInputClick(e)).bind(this));
      this.bindPlaySoundButtons(html);
      this.bindRemoveSoundButtons(html);
      this.bindVolumeSliders(html);
      this.bindEnableSoundButtons(html);
   }

   simulateCritInputClick(e) {
      e.preventDefault();
      e.stopPropagation();
      new FilePicker({
         type: "audio",
         displayMode: "list",
         canUpload: "true",
         callback: (path) => this.onAddCrit(path),
      }).render();
   }

   simulateFumbleInputClick(e) {
      e.preventDefault();
      e.stopPropagation();
      new FilePicker({
         type: "audio",
         displayMode: "list",
         canUpload: "true",
         callback: (path) => this.onAddFumble(path),
      }).render();
   }

   bindVolumeSliders(html) {
      this.data.critSounds.forEach((soundObject, index) => {
         html
            .find(`input[id="crit-sound-volume-${index}`)
            .change(((e) => this.onVolumeUpdate(e, soundObject)).bind(this));
      });
      this.data.fumbleSounds.forEach((soundObject, index) => {
         html
            .find(`input[id="fumble-sound-volume-${index}`)
            .change(((e) => this.onVolumeUpdate(e, soundObject)).bind(this));
      });
   }

   bindPlaySoundButtons(html) {
      this.data.critSounds.forEach((soundObject, index) => {
         html
            .find(`button[id="play-crit-sound-${index}`)
            .click(((e) => this.onPlaySound(e, soundObject)).bind(this));
      });
      this.data.fumbleSounds.forEach((soundObject, index) => {
         html
            .find(`button[id="play-fumble-sound-${index}`)
            .click(((e) => this.onPlaySound(e, soundObject)).bind(this));
      });
   }

   bindEnableSoundButtons(html) {
      this.data.critSounds.forEach((soundObject, index) => {
         html
            .find(`#enable-crit-sound-${index}`)
            .click(((e) => this.onEnableToggle(e, soundObject)).bind(this));
      });
      this.data.fumbleSounds.forEach((soundObject, index) => {
         html
            .find(`#enable-fumble-sound-${index}`)
            .click(((e) => this.onEnableToggle(e, soundObject)).bind(this));
      });
   }

   bindRemoveSoundButtons(html) {
      this.data.critSounds.forEach((soundObject, index) => {
         if (soundObject.isUserAddedSound) {
            html.find(`button[id="delete-crit-sound-${index}`).click(
               ((e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.storedSettings.critSounds.splice(index, 1);
                  this.render();
               }).bind(this)
            );
         }
      });

      this.data.fumbleSounds.forEach((soundObject, index) => {
         if (soundObject.isUserAddedSound) {
            html.find(`button[id="delete-fumble-sound-${index}`).click(
               ((e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.storedSettings.fumbleSounds.splice(index, 1);
                  this.render();
               }).bind(this)
            );
         }
      });
   }

   onReset() {
      this.storedSettings = JSON.parse(JSON.stringify(defaultSettings));
      this.render();
   }

   onAddCrit(newFilePath) {
      this.storedSettings.critSounds.push({
         enabled: true,
         path: newFilePath,
         isUserAddedSound: true,
         volume: 0.8,
      });
      this.render();
      this.scrollToBottom("#crit-sounds-list");
   }

   onAddFumble(newFilePath) {
      this.storedSettings.fumbleSounds.push({
         enabled: true,
         path: newFilePath,
         isUserAddedSound: true,
         volume: 0.8,
      });
      this.render();
      this.scrollToBottom("#fumble-sounds-list");
   }

   scrollToBottom(selector) {
      setTimeout(() => {
         $(selector).scrollTop($(selector)[0].scrollHeight);
      }, 100);
   }

   onPlaySound(e, soundObject) {
      e.preventDefault();
      e.stopPropagation();
      soundEffectController.playSound(
         {
            src: soundObject.path,
            volume: soundObject.volume,
            autoplay: true,
            loop: false,
         },
         false
      );
   }

   onVolumeUpdate(e, soundObject) {
      soundObject.volume = Number(e.currentTarget.value);
      this.render();
   }

   onEnableToggle(e, soundObject) {
      soundObject.enabled = !soundObject.enabled;
      this.render();
   }

   _updateObject(events, formData) {
      let updatedSettings = {
         ...game.settings.get(constants.modName, "settings"),
         critSounds: JSON.parse(JSON.stringify(this.storedSettings.critSounds)),
         fumbleSounds: JSON.parse(
            JSON.stringify(this.storedSettings.fumbleSounds)
         ),
      };

      game.settings.set(constants.modName, "settings", updatedSettings);
   }
}
