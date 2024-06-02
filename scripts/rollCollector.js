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

      // Check for and parse inline rolls
      if (msg.content.indexOf("inline-roll") !== -1) {
         const inlineRolls = parseInlineRoll(msg);
         if (inlineRolls.length) {
            rolls = rolls.concat(inlineRolls);
         }
      }

      const isRoller = msg.author.id == game.userId;
      const isPublicRoll = rolls.length && !msg.whisper.length;

      if (!!rolls.length && isRoller && !disableDueToNPC(msg.speaker)) {
         pendingRolls.set(msg.id, { rolls, isPublicRoll });
      }
   });

   Hooks.on("renderChatMessage", (msg) => {
      const storedInfo = pendingRolls.get(msg.id);

      if (!storedInfo) {
         return;
      }

      // Check for and parse inline rolls
      let rolls = msg.rolls;
      if (msg.content.indexOf("inline-roll") !== -1) {
         const inlineRolls = parseInlineRoll(msg);
         if (inlineRolls.length) {
            rolls = rolls.concat(inlineRolls);
         }
      }

      // Update the stored rolls with the determined results but delay handling effects until the
      // diceSoNice rolling animation is complete
      if (diceSoNiceActive) {
         pendingRolls.set(msg.id, {
            rolls: rolls,
            isPublicRoll: storedInfo.isPublicRoll,
         });
         return;
      }

      if (rolls) {
         handleEffects(rolls, storedInfo.isPublicRoll);
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
   const settingEnabled = game.settings.get(
      constants.modName,
      "disable-npc-rolls"
   );
   const actor = ChatMessage.getSpeakerActor(speaker);
   const actorHasPlayerOwner = actor ? actor.hasPlayerOwner : false;
   const isGM = game.users.get(game.userId).isGM;

   return settingEnabled && !actorHasPlayerOwner && isGM;
};

const parseInlineRoll = (msg) => {
   let JqInlineRolls = $($.parseHTML(msg.content)).filter(
      ".inline-roll.inline-result"
   );

   if (JqInlineRolls.length == 0 && !msg.isRoll) {
      //it was a false positive
      return [];
   }

   let inlineRollList = [];
   JqInlineRolls.each((index, el) => {
      inlineRollList.push(Roll.fromJSON(unescape(el.dataset.roll)));
   });

   return inlineRollList;
};
