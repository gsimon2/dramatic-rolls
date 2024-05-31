import soundEffectController from "./soundEffectController.js";
import { registerSettings } from "./settings.js";
import constants from "../constants.js";
import { initRollCollection } from "./rollCollector.js";
import { setupConfetti, fireConfetti } from "./confetti.js";

const socketName = `module.${constants.modName}`;

Hooks.on("init", () => {
   registerSettings();
   if (constants.debugMode) {
      CONFIG.debug.hooks = true;
   }
});

Hooks.on("ready", () => {
   initRollCollection();
   setupConfetti();

   if (game.settings.get(constants.modName, "add-confetti")) {
      game.socket.on(socketName, fireConfetti);
   }
});

export const handleEffects = (roll, isPublic = true) => {
   const shouldPlay =
      isPublic ||
      !game.settings.get(constants.modName, "trigger-on-public-only");
   const shouldBroadcastToOtherPlayers = isPublic;
   const summarizedDieRolls = getSummarizedDieRolls(roll);
   const isCrit = determineIfCrit(summarizedDieRolls);
   const isFumble = determineIfFumble(summarizedDieRolls);

   if (isFumble) {
      roll = foundry.utils.mergeObject(roll, {
         soundEffect: soundEffectController.getFumbleSoundEffect(),
      });
   }

   if (isCrit) {
      roll = foundry.utils.mergeObject(roll, {
         soundEffect: soundEffectController.getCritSoundEffect(),
      });
   }

   shouldPlay && isCrit && handleConfetti(shouldBroadcastToOtherPlayers);
   shouldPlay &&
      game.settings.get(constants.modName, "add-sound") &&
      playSound(roll, shouldBroadcastToOtherPlayers);
};

const getIsRollOverrideCrit = (roll) => {
   if (
      game.system.id === "pf2e" &&
      game.settings.get(constants.modName, "pf2e-trigger-on-degree-of-success")
   ) {
      return roll.options?.degreeOfSuccess === 3;
   }
   return false;
};

const getIsRollOverrideFumble = (roll) => {
   if (
      game.system.id === "pf2e" &&
      game.settings.get(constants.modName, "pf2e-trigger-on-degree-of-success")
   ) {
      return roll.options?.degreeOfSuccess === 0;
   }
   return false;
};

const getSummarizedDieRolls = (rolls) => {
   const die = rolls.flatMap((roll) => {
      const d = roll.terms.filter((t) => t instanceof foundry.dice.terms.Die);
      const isOverrideCrit = getIsRollOverrideCrit(roll);
      const isOverrideFumble = getIsRollOverrideFumble(roll);
      return d.map((d) => ({ ...d, isOverrideCrit, isOverrideFumble }));
   });

   const results = die.flatMap((d) => {
      const faces = d?.faces ?? d?._faces;
      const results =
         d.results?.filter((r) => r.active)?.map((r) => r.result) ?? [];

      return results.map((r) => {
         return {
            faces: faces,
            result: r,
            isOverrideCrit: d.isOverrideCrit,
            isOverrideFumble: d.isOverrideFumble,
         };
      });
   });

   return results;
};

const determineIfCrit = (summarizedDieRolls) => {
   return !!(
      summarizedDieRolls
         .filter((r) => r.faces === 20)
         .some((r) => r.result === 20) ||
      summarizedDieRolls.some((r) => r.isOverrideCrit) ||
      constants.debugMode
   );
};

const determineIfFumble = (summarizedDieRolls) => {
   return !!(
      summarizedDieRolls
         .filter((r) => r.faces === 20)
         .some((r) => r.result === 1) ||
      summarizedDieRolls.some((r) => r.isOverrideFumble)
   );
};

const playSound = (roll, broadcastSound) => {
   const soundEffect = roll.soundEffect;

   if (soundEffect && soundEffect.path) {
      foundry.audio.AudioHelper.play(
         {
            src: soundEffect.path,
            volume: soundEffect.volume,
            autoplay: true,
            loop: false,
         },
         broadcastSound
      );
   }
};

const handleConfetti = (shouldBroadcastToOtherPlayers) => {
   if (game.settings.get(constants.modName, "add-confetti")) {
      fireConfetti();
   }

   if (shouldBroadcastToOtherPlayers) {
      game.socket.emit(socketName);
   }
};
