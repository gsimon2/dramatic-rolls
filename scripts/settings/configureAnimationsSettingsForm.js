import constants from "../../constants.js";
import { defaultSettings } from "./settings.js";
import animationController from "../controllers/animationController.js";

export class ConfigureAnimationSettingsForm extends FormApplication {
   static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
         title: game.i18n.localize(
            `${constants.modName}.configure-animations-settings-form.title`
         ),
         id: `${constants.modName}-configure-animations-settings-form`,
         template: `modules/${constants.modName}/templates/animation-settings-form.handlebars`,
         width: 500,
         closeOnSubmit: true,
         scrollY: ["#crit-animations-list", "#fumble-animations-list"],
      });
   }

   storedSettings = {};

   getData(options) {
      if ($.isEmptyObject(this.storedSettings)) {
         this.storedSettings = game.settings.get(constants.modName, "settings");
      }

      const nonSettingData = {
         criticalAnimations: animationController.criticalAnimations.map(
            (animation) => ({
               ...animation,
               ...this.storedSettings.criticalAnimations.find(
                  (a) => animation.id === a.id
               ) ?? { enabled: true },
            })
         ),
         fumbleAnimations: animationController.fumbleAnimations.map(
            (animation) => ({
               ...animation,
               ...this.storedSettings.fumbleAnimations.find(
                  (a) => animation.id === a.id
               ),
            }) ?? { enabled: true },
         ),
      };

      const data = foundry.utils.mergeObject(
         this.storedSettings,
         nonSettingData
      );

      this.data = data;
      return data;
   }

   activateListeners(html) {
      super.activateListeners(html);
      html.find('button[name="reset"]').click(this.onReset.bind(this));
      this.bindEnableAnimationButtons(html);
      this.bindPlayAnimationButtons(html);
   }

   bindPlayAnimationButtons(html) {
      this.data.criticalAnimations.forEach((animation, index) => {
         html
            .find(`button[id="play-crit-animation-${index}`)
            .click(((e) => this.onPlayAnimation(e, animation.id, 20)).bind(this));
      });
      this.data.fumbleAnimations.forEach((animation, index) => {
         html
            .find(`button[id="play-fumble-animation-${index}`)
            .click(((e) => this.onPlayAnimation(e, animation.id, 1)).bind(this));
      });
   }

   bindEnableAnimationButtons(html) {
      this.data.criticalAnimations.forEach((animation, index) => {
         html
            .find(`#enable-crit-animation-${index}`)
            .click(((e) => this.onEnableToggle(e, animation)).bind(this));
      });

      this.data.fumbleAnimations.forEach((animation, index) => {
         html
            .find(`#enable-fumble-animation-${index}`)
            .click(((e) => this.onEnableToggle(e, animation)).bind(this));
      });
   }

   onReset() {
      this.storedSettings = JSON.parse(JSON.stringify(defaultSettings));
      this.render();
   }

   onPlayAnimation(e, id, num) {
      e.preventDefault();
      e.stopPropagation();
      animationController.playById(id, num);
   }

   onEnableToggle(e, animationObject) {
      animationObject.enabled = !animationObject.enabled;
      this.render();
   }

   _updateObject(events, formData) {
      let updatedSettings = {
         ...game.settings.get(constants.modName, "settings"),
         criticalAnimations: this.storedSettings.criticalAnimations.map(
            (animation) => ({ enabled: animation.enabled, id: animation.id })
         ),
         fumbleAnimations: this.storedSettings.fumbleAnimations.map(
            (animation) => ({ enabled: animation.enabled, id: animation.id })
         )
      };

      game.settings.set(constants.modName, "settings", updatedSettings);
   }
}
