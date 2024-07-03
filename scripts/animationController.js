import soundEffectController from "./soundEffectController.js";
import { setupConfetti, fireConfetti } from "./confetti.js";
import { setupNumberPop, animateCount } from "./animations/numberPop.js";
import constants from "../constants.js";

// Need to handle selecting a random animation to play
// Need to handle / check emitting events on the socket and having other clients play the same sound / animation
// Need to add animations to the settings menu

const playCriticalAnimation = (shouldBroadcastToOtherPlayers) => {
   const soundEffect = soundEffectController.getCritSoundEffect();
   playSound(soundEffect, shouldBroadcastToOtherPlayers);

   if (game.settings.get(constants.modName, "add-confetti")) {
      fireConfetti();
      animateCount(20, true, false);
   }

   if (shouldBroadcastToOtherPlayers) {
      game.socket.emit(constants.socketName);
   }
};

const playFumbleAnimation = (shouldBroadcastToOtherPlayers) => {
   const soundEffect = soundEffectController.getFumbleSoundEffect();
   playSound(soundEffect, shouldBroadcastToOtherPlayers);

   if (game.settings.get(constants.modName, "add-confetti")) {
      animateCount(1, false, true);
   }

   if (shouldBroadcastToOtherPlayers) {
      game.socket.emit(constants.socketName);
   }
};

const playSound = (soundEffect, broadcastSound) => {
   if (soundEffect && soundEffect.path) {
      soundEffectController.playSound(
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

const setupAnimations = () => {
   setupConfetti();
   setupNumberPop();
};

export default {
   playCriticalAnimation,
   playFumbleAnimation,
   setupAnimations,
};
