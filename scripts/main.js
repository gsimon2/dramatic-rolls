import soundEffectController from "./soundEffectController.js";
import { registerSettings, registerConfettiSetting } from "./settings.js";
import constants from "../constants.js";
import { initRollCollection } from "./rollCollector.js";

Hooks.on("init", () => {
   registerSettings();
   if (constants.debugMode) {
      CONFIG.debug.hooks = true;
   }
});

Hooks.on("ready", () => {
   if (game.modules.get("confetti")?.active) {
      registerConfettiSetting();
   }
   initRollCollection();
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
      roll = mergeObject(roll, {
         soundEffect: soundEffectController.getFumbleSoundEffect(),
      });
   }

   if (isCrit) {
      roll = mergeObject(roll, {
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
      return roll.data?.degreeOfSuccess === 3;
   }
   return false;
};

const getIsRollOverrideFumble = (roll) => {
   if (
      game.system.id === "pf2e" &&
      game.settings.get(constants.modName, "pf2e-trigger-on-degree-of-success")
   ) {
      return roll.data?.degreeOfSuccess === 0;
   }
   return false;
};

const getSummarizedDieRolls = (rolls) => {
   const die = rolls.flatMap((roll) => {
      const d = roll.terms.filter((t) => t instanceof Die);
      const isOverrideCrit = getIsRollOverrideCrit(roll);
      const isOverrideFumble = getIsRollOverrideFumble(roll);
      return d.map((d) => ({ ...d, isOverrideCrit, isOverrideFumble }));
   });

   const results = die.flatMap((d) => {
      const faces = d.faces;
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
      AudioHelper.play(
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
   try {
      if (game.settings.get(constants.modName, "add-confetti")) {
         const strength = window.confetti.confettiStrength.high;
         const shootConfettiProps =
            window.confetti.getShootConfettiProps(strength);
         mergeObject(shootConfettiProps, { sound: null });

         if (shouldBroadcastToOtherPlayers) {
            window.confetti.shootConfetti(shootConfettiProps);
         } else {
            window.confetti.handleShootConfetti(shootConfettiProps);
         }
      }
   } catch {
      // Oh well, means the confetti mod isn't installed
   }
};
