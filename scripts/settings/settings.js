import constants from "../../constants.js";
import { ConfigureSoundSettingsForm } from "./configureSoundSettingsForm.js";
import { ConfigureAnimationSettingsForm } from "./configureAnimationsSettingsForm.js";
import soundEffectController from "../controllers/soundEffectController.js";
import animationController from "../controllers/animationController.js";

export const defaultSettings = {
   critSounds: soundEffectController.critSoundEffectFiles.map(
      (soundFilePath) => ({
         enabled: true,
         path: soundFilePath,
         isUserAddedSound: false,
         volume: 1.0,
      })
   ),
   fumbleSounds: soundEffectController.fumbleSoundEffectFiles.map(
      (soundFilePath) => ({
         enabled: true,
         path: soundFilePath,
         isUserAddedSound: false,
         volume: 1.0,
      })
   ),
   criticalAnimations: animationController.criticalAnimations.map(
      (animation) => ({
         enabled: true,
         id: animation.id,
      })
   ),
   fumbleAnimations: animationController.fumbleAnimations.map((animation) => ({
      enabled: true,
      id: animation.id,
   })),
};

export const handleMigrationSettings = () => {
   const settings = game.settings.get(constants.modName, "settings");

   // Add settings for the animations if they are not already present
   if (!settings.criticalAnimations) {
      settings.criticalAnimations = defaultSettings.criticalAnimations;
   }
   if (!settings.fumbleAnimations) {
      settings.fumbleAnimations = defaultSettings.fumbleAnimations;
   }

   game.settings.set(constants.modName, "settings", settings);
};

export const registerSettings = () => {
   game.settings.registerMenu(constants.modName, "configuration-menu", {
      name: "dramatic-rolls.settings.configure-sounds.name",
      label: "dramatic-rolls.settings.configure-sounds.name",
      hint: "dramatic-rolls.settings.configure-sounds.label",
      icon: "fas fa-cogs",
      type: ConfigureSoundSettingsForm,
      scope: "world",
      restricted: true,
   });

   game.settings.registerMenu(constants.modName, "animation-menu", {
      name: "dramatic-rolls.settings.configure-animations.name",
      label: "dramatic-rolls.settings.configure-animations.name",
      hint: "dramatic-rolls.settings.configure-animations.label",
      icon: "fas fa-cogs",
      type: ConfigureAnimationSettingsForm,
      scope: "world",
      restricted: true,
   });

   game.settings.register(constants.modName, "settings", {
      name: `${constants.modName}-settings`,
      scope: "world",
      default: defaultSettings,
      type: Object,
      config: false,
   });

   game.settings.register(constants.modName, "disable-npc-rolls", {
      name: "dramatic-rolls.settings.disable-npc-rolls.name",
      hint: "dramatic-rolls.settings.disable-npc-rolls.label",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
   });

   game.settings.register(constants.modName, "trigger-on-public-only", {
      name: "dramatic-rolls.settings.trigger-on-public-only.name",
      hint: "dramatic-rolls.settings.trigger-on-public-only.label",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
   });

   game.settings.register(constants.modName, "play-animations", {
      name: "dramatic-rolls.settings.play-animations.name",
      hint: "dramatic-rolls.settings.play-animations.label",
      scope: "client",
      config: true,
      default: true,
      type: Boolean,
   });

   game.settings.register(constants.modName, "add-sound", {
      name: "dramatic-rolls.settings.add-sound.name",
      hint: "dramatic-rolls.settings.add-sound.label",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
   });

   if (game.system.id === "pf2e") {
      game.settings.register(
         constants.modName,
         "pf2e-trigger-on-degree-of-success",
         {
            name: "dramatic-rolls.settings.pf2e-trigger-on-degree-of-success.name",
            hint: "dramatic-rolls.settings.pf2e-trigger-on-degree-of-success.label",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
         }
      );
   }
};
