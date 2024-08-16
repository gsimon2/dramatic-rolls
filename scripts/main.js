import {
   registerSettings,
   handleMigrationSettings,
} from "./settings/settings.js";
import constants from "../constants.js";
import { initRollCollection } from "./rollCollector.js";
import { parseFromGurpsRoll } from "./utils.js";
import animationController from "./controllers/animationController.js";

Hooks.on("init", () => {
   registerSettings();

   if (constants.debugMode) {
      CONFIG.debug.hooks = true;
      CONFIG.debug.audio = true;
      CONFIG.debug.dice = true;
      CONFIG.debug.rollParsing = true;
   }
});

Hooks.on("ready", () => {
   handleMigrationSettings();
   initRollCollection();
});

export const handleEffects = (roll, isPublic = true) => {
   const shouldPlay =
      isPublic ||
      !game.settings.get(constants.modName, "trigger-on-public-only");
   const shouldBroadcastToOtherPlayers = isPublic;
   const summarizedDieRolls = getSummarizedDieRolls(roll);
   const { isCrit, isOverrideCrit } = determineIfCrit(summarizedDieRolls);
   const { isFumble, isOverrideFumble } = determineIfFumble(summarizedDieRolls);

   if (shouldPlay && isCrit) {
      animationController.playCriticalAnimation(
         isOverrideCrit ? 'Crit!' : summarizedDieRolls[0].result,
         shouldBroadcastToOtherPlayers
      );
   }

   if (shouldPlay && isFumble) {
      animationController.playFumbleAnimation(
         isOverrideFumble ? 'Fumble!' : summarizedDieRolls[0].result,
         shouldBroadcastToOtherPlayers
      );
   }
};

const getIsRollOverrideCrit = (roll) => {
   if (
      game.system.id === "pf2e" &&
      game.settings.get(constants.modName, "pf2e-trigger-on-degree-of-success")
   ) {
      return roll.options?.degreeOfSuccess === 3;
   }
   if (game.system.id === "gurps") {
      return parseFromGurpsRoll(roll).isCritSuccess
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
   if (game.system.id === "gurps") {
      return parseFromGurpsRoll(roll).isCritFailure
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
   return {
      isCrit: !!(
         summarizedDieRolls
            .filter((r) => r.faces === 20)
            .some((r) => r.result === 20) ||
         summarizedDieRolls.some((r) => r.isOverrideCrit) ||
         constants.overrideCrit
      ),
      isOverrideCrit:
         !summarizedDieRolls
            .filter((r) => r.faces === 20)
            .some((r) => r.result === 20) &&
         summarizedDieRolls.some((r) => r.isOverrideCrit),
   };
};

const determineIfFumble = (summarizedDieRolls) => {
   return {
      isFumble: !!(
         summarizedDieRolls
            .filter((r) => r.faces === 20)
            .some((r) => r.result === 1) ||
         summarizedDieRolls.some((r) => r.isOverrideFumble) ||
         constants.overrideFumble
      ),
      isOverrideFumble:
         !summarizedDieRolls
            .filter((r) => r.faces === 20)
            .some((r) => r.result === 1) &&
         summarizedDieRolls.some((r) => r.isOverrideFumble),
   };
};
