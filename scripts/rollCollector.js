import constants from "../constants.js";
import { handleEffects } from "./main.js";

/**
 * Pending Rolls Map
 *  Key = msgId
 *  Value = {
 *    rolls: [Roll]
 *    isPublicRoll: boolean
 *  }
 */
let pendingRolls = new Map();
let diceSoNiceActive = false;

export const initRollCollection = () => {
   Hooks.on("createChatMessage", (msg) => {
      let rolls = msg.rolls;
      const isRoller = msg.user.id == game.userId;
      const isPublicRoll = rolls.length && !msg.whisper.length;

      if (rolls.length && isRoller && !disableDueToNPC(msg.speaker)) {
         pendingRolls.set(msg.id, { rolls, isPublicRoll });
      }
   });

   Hooks.on("renderChatMessage", (msg) => {
      const storedInfo = pendingRolls.get(msg.id);

      // Update the stored rolls with the determined results but delay handling effects until the
      // diceSoNice rolling animation is complete
      if (diceSoNiceActive) {
         pendingRolls.set(msg.id, {
            rolls: msg.rolls,
            isPublicRoll: storedInfo.isPublicRoll,
         });
         return;
      }

      if (storedInfo && msg.rolls) {
         handleEffects(msg.rolls, storedInfo.isPublicRoll);
         pendingRolls.delete(msg.id);
      }
   });

   if (game.modules.get("dice-so-nice")?.active) {
      diceSoNiceActive = true;

      Hooks.on("diceSoNiceRollComplete", (msgId) => {
         const storedInfo = pendingRolls.get(msgId);

         if (storedInfo?.rolls) {
            handleEffects(storedInfo.rolls, storedInfo.isPublicRoll);
            pendingRolls.delete(msgId);
         }
      });
   }

   if (game.modules.get("midi-qol")?.active) {
      // Handles the midi-qol merge rolls onto one card setting
      Hooks.on("midi-qol.AttackRollComplete", (workflow) => {
         const rolls = [workflow.attackRoll];
         const isPublic = workflow.attackRoll.options.rollMode === "roll";
         !disableDueToNPC(workflow.speaker) && handleEffects(rolls, isPublic);
      });
   }
};

const disableDueToNPC = (speaker) => {
   const settingEnabld = game.settings.get(
      constants.modName,
      "disable-npc-rolls"
   );
   const actor = ChatMessage.getSpeakerActor(speaker);
   const actorHasPlayerOwner = actor ? actor.hasPlayerOwner : false;
   const isGM = game.users.get(game.userId).isGM;

   return settingEnabld && !actorHasPlayerOwner && isGM;
};
