import soundEffectController from "./soundEffectController.js";
import {
   numberPop,
   numberFlyInFallDown,
} from "../animations/numberAnimations.js";
import constants from "../../constants.js";
import {
   fireConfetti,
   fireFireworkConfetti,
   firePoopConfetti,
   fireEmojiConfetti,
} from "../animations/confetti.js";

class Animation {
   constructor(id, name, animationFunction, playSoundEffect = true) {
      this.id = id;
      this.name = name;
      this.animationFunction = animationFunction;
      this.playSoundEffect = playSoundEffect;
   }

   play = (num) => {
      if (game.settings.get(constants.modName, "play-animations")) {
         this.animationFunction(num);
      }
   };
}

class AnimationController {
   constructor() {
      this.criticalAnimations = [
         new Animation("confetti", "Confetti", fireConfetti),
         new Animation("number-pop-critical", "Number Pop Critical", (num) =>
            numberPop(num, true, false)
         ),
         new Animation(
            "firework-confetti",
            "Firework Confetti",
            fireFireworkConfetti
         ),
         new Animation(
            "emoji-confetti",
            "Emoji Confetti",
            fireEmojiConfetti,
            false
         ),
         new Animation(
            "number-fly-in-fall-down-critical",
            "Number Fly In Then Fall Down Critical",
            (num) => numberFlyInFallDown(num, true)
         ),
      ];

      this.fumbleAnimations = [
         new Animation("number-pop-fumble", "Number Pop Fumble", (num) =>
            numberPop(num, false, true)
         ),
         new Animation(
            "poop-confetti",
            "Poop Emoji Confetti",
            firePoopConfetti,
            false
         ),
         new Animation(
            "number-fly-in-fall-down-fumble",
            "Number Fly In Then Fall Down fumble",
            (num) => numberFlyInFallDown(num, false)
         ),
      ];

      this.#setupAnimations();

      Hooks.on("ready", () => {
         game.socket.on(constants.socketName, (data) =>
            this.playById(data.id, data.num)
         );
      });
   }

   #setupAnimations = () => {
      const animationContainer = document.createElement("div");
      animationContainer.id = "animation-container";
      document.body.appendChild(animationContainer);
   };

   #playSound = (soundEffect, broadcastSound) => {
      if (
         soundEffect &&
         soundEffect.path &&
         game.settings.get(constants.modName, "add-sound")
      ) {
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
      const gameSettings = game.settings.get(constants.modName, "settings");
      const enabledAnimations = this.criticalAnimations.filter(
         (a) =>
            gameSettings.criticalAnimations?.find((b) => b.id === a.id)
               ?.enabled ?? true
      );
      const animation =
         enabledAnimations[
            Math.floor(Math.random() * enabledAnimations.length)
         ];

      if (animation.playSoundEffect) {
         const soundEffect = soundEffectController.getCritSoundEffect();
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
      }

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
      const gameSettings = game.settings.get(constants.modName, "settings");
      const enabledAnimations = this.fumbleAnimations.filter(
         (a) =>
            gameSettings.fumbleAnimations?.find((b) => b.id === a.id)
               ?.enabled ?? true
      );
      const animation =
         enabledAnimations[
            Math.floor(Math.random() * enabledAnimations.length)
         ];

      if (animation.playSoundEffect) {
         const soundEffect = soundEffectController.getFumbleSoundEffect();
         this.#playSound(soundEffect, shouldBroadcastToOtherPlayers);
      }

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
