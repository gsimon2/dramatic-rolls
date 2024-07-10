import soundEffectController from "./soundEffectController.js";
import { setupNumberPop, animateCount } from "./animations/numberPop.js";
import constants from "../constants.js";
import {
   fireConfetti,
   fireFireworkConfetti,
   firePoopConfetti,
   fireEmojiConfetti
} from "./animations/confetti.js";

// Need to add animations to the settings menu
class Animation {
   constructor(id, animationFunction, playSoundEffect = true) {
      this.id = id;
      this.animationFunction = animationFunction;
      this.playSoundEffect = playSoundEffect;
   }

   play = (num) => {
      this.animationFunction(num);
   };
}

class AnimationController {
   constructor() {
      this.criticalAnimations = [
         new Animation("confetti", fireConfetti),
         new Animation("firework-confetti", fireFireworkConfetti),
         new Animation("emoji-confetti", fireEmojiConfetti, false),
         new Animation("number-pop-critical", (num) =>
            animateCount(num, true, false)
         ),
      ];

      this.fumbleAnimations = [
         new Animation("number-pop-fumble", (num) =>
            animateCount(num, false, true)
         ),
         new Animation("poop-confetti", firePoopConfetti, false),
      ];

      this.#setupAnimations();

      Hooks.on("ready", () => {
         // Do we need to check settings before we play?
         game.socket.on(constants.socketName, (data) =>
            this.playById(data.id, data.num)
         );
      });
   }

   #setupAnimations = () => {
      setupNumberPop();
   };

   #playSound = (soundEffect, broadcastSound) => {
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

   playById = (id, num) => {
      const animiations = [
         ...this.criticalAnimations,
         ...this.fumbleAnimations,
      ];
      const animation = animiations.find((animation) => animation.id === id);
      if (animation) {
         animation.play(num);
      } else {
         console.error(`Animation with id "${id}" not found.`);
      }
   };

   playCriticalAnimation = (num, shouldBroadcastToOtherPlayers) => {
      const animation =
         this.criticalAnimations[
            Math.floor(Math.random() * this.criticalAnimations.length)
         ];

      if (animation.playSoundEffect) {
         const soundEffect = soundEffectController.getCritSoundEffect();
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
      }

      // Do we need to check settings before we play?
      animation.play(num);

      if (shouldBroadcastToOtherPlayers) {
         game.socket.emit(constants.socketName, {
            type: "play-animation",
            id: animation.id,
            num,
         });
      }
   };

   playFumbleAnimation = (num, shouldBroadcastToOtherPlayers) => {
      const animation =
         this.fumbleAnimations[
            Math.floor(Math.random() * this.fumbleAnimations.length)
         ];

      if (animation.playSoundEffect) {
         const soundEffect = soundEffectController.getFumbleSoundEffect();
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
      }

      // Do we need to check settings before we play?
      animation.play(num);

      if (shouldBroadcastToOtherPlayers) {
         game.socket.emit(constants.socketName, {
            type: "play-animation",
            id: animation.id,
            num,
         });
      }
   };
}

export default new AnimationController();
