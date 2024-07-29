import confetti from "https://cdn.skypack.dev/canvas-confetti"; // https://www.npmjs.com/package/canvas-confetti
import soundEffectController from "../controllers/soundEffectController.js";
import constants from "../../constants.js";
import { getDistinct, getRandomArbitrary } from "../utils.js";

const zIndex = 109;
const colors = [
   "#fbda61",
   "#ffce1f",
   "#ff5acd",
   "#6182fb",
   "#1fc0ff",
   "#cffb61",
   "#82fb61",
   "#5aff8b",
   "#1fff5e",
   "#61fbda",
   "#de5aff",
   "#ff5a7b",
   "#ff1f50",
   "#ff8c5a",
   "#FF5F1F",
   "#1f1fff",
   "#ff1fc0",
   "#5affff",
   "#fb611f",
   "#c061ff",
   "#61cffb",
   "#da61fb",
   "#5aff82",
   "#ff5ede",
   "#8b5aff",
];

// document.body.addEventListener("click", () => {
//    // fireConfetti();
//    // fireFireworkConfetti();
//    // firePoopConfetti();
//    // fireEmojiConfetti();
//    // fireCrossBonesConfetti();
// });

const getExplosionPoints = () => {
   return [
      { x: getRandomArbitrary(0.05, 0.5), y: getRandomArbitrary(0.1, 0.5) },
      { x: getRandomArbitrary(0.05, 0.5), y: getRandomArbitrary(0.3, 0.8) },
      { x: getRandomArbitrary(0.5, 0.9), y: getRandomArbitrary(0.1, 0.5) },
      { x: getRandomArbitrary(0.5, 0.9), y: getRandomArbitrary(0.3, 0.8) },
      { x: getRandomArbitrary(0.05, 0.8), y: getRandomArbitrary(0.1, 0.7) },
      { x: getRandomArbitrary(0.05, 0.8), y: getRandomArbitrary(0.1, 0.8) },
   ];
};

const fireCustomShapesConfetti = ({
   shapes,
   soundPath,
   flat = false,
   particleCount = 100,
}) => {
   getExplosionPoints().forEach((point, index) => {
      setTimeout(() => {
         if (soundPath) {
            soundEffectController.playSound(
               {
                  src: soundPath,
                  volume: 0.5,
                  autoplay: true,
                  loop: false,
               },
               true
            );
         }

         confetti({
            particleCount: 100,
            spread: 360,
            startVelocity: 20,
            origin: point,
            angle: 90,
            scalar: 4,
            shapes: shapes,
            flat: flat,
            zIndex: zIndex,
         });
      }, getRandomArbitrary(150, 250) * index);
   });
};

export const fireConfetti = () => {
   const points = [
      { x: 0, angle: 45 },
      { x: 0.25, angle: 60 },
      { x: 0.5, angle: 90 },
      { x: 0.75, angle: 120 },
      { x: 1, angle: 135 },
   ];

   points.forEach((point, index) => {
      setTimeout(() => {
         soundEffectController.playSound(
            {
               src: `modules/${constants.modName}/sounds/confetti/little_pop.mp3`,
               volume: 0.6,
               autoplay: true,
               loop: false,
            },
            true
         );

         confetti({
            particleCount: 300,
            spread: 100,
            startVelocity: 70,
            origin: { y: 0.95, x: point.x },
            colors: getDistinct(colors, 3),
            angle: point.angle,
            scalar: 1.5,
            zIndex: zIndex,
         });
      }, 200 * index);
   });
};

export const fireFireworkConfetti = () => {
   getExplosionPoints().forEach((point, index) => {
      setTimeout(() => {
         soundEffectController.playSound(
            {
               src: `modules/${constants.modName}/sounds/confetti/big_pop.mp3`,
               volume: 0.5,
               autoplay: true,
               loop: false,
            },
            true
         );

         confetti({
            particleCount: 500,
            spread: 360,
            startVelocity: 40,
            origin: point,
            colors: getDistinct(colors, 5),
            angle: 90,
            scalar: 1.5,
            shapes: ["square", "circle", "star"],
            zIndex: zIndex,
         });
      }, getRandomArbitrary(75, 200) * index);
   });
};

export const firePoopConfetti = () => {
   var poop = confetti.shapeFromText({ text: "💩", scalar: 4 });
   fireCustomShapesConfetti({
      shapes: [poop],
      soundPath: `modules/${constants.modName}/sounds/fumble/fart.mp3`,
      flat: true,
   });
};

export const fireEmojiConfetti = () => {
   fireCustomShapesConfetti({
      shapes: [
         confetti.shapeFromText({ text: "🎉", scalar: 4 }),
         confetti.shapeFromText({ text: "😁", scalar: 4 }),
         confetti.shapeFromText({ text: "🔥", scalar: 4 }),
         confetti.shapeFromText({ text: "💎", scalar: 4 }),
         confetti.shapeFromText({ text: "⭐", scalar: 4 }),
         confetti.shapeFromText({ text: "😍", scalar: 4 }),
         confetti.shapeFromText({ text: "❤", scalar: 4 }),
      ],
      soundPath: `modules/${constants.modName}/sounds/crit/magical-twinkle-sparkle-whoosh.mp3`,
      flat: false,
      particleCount: 80,
   });

   getExplosionPoints().forEach((point, index) => {
      setTimeout(() => {
         soundEffectController.playSound(
            {
               src: `modules/${constants.modName}/sounds/crit/magical-twinkle-sparkle-whoosh.mp3`,
               volume: 0.5,
               autoplay: true,
               loop: false,
            },
            true
         );

         confetti({
            particleCount: 100,
            spread: 360,
            startVelocity: 25,
            origin: point,
            angle: 90,
            scalar: 4,
            shapes: [
               confetti.shapeFromText({ text: "🎉", scalar: 4 }),
               confetti.shapeFromText({ text: "😁", scalar: 4 }),
               confetti.shapeFromText({ text: "🔥", scalar: 4 }),
               confetti.shapeFromText({ text: "💎", scalar: 4 }),
               confetti.shapeFromText({ text: "⭐", scalar: 4 }),
               confetti.shapeFromText({ text: "😍", scalar: 4 }),
               confetti.shapeFromText({ text: "❤", scalar: 4 }),
            ],
            flat: false,
            zIndex: zIndex,
         });
      }, getRandomArbitrary(150, 250) * index);
   });
};

export const fireCrossBonesConfetti = () => {
   const crossbones = confetti.shapeFromText({ text: "☠", scalar: 4 });
   fireCustomShapesConfetti({
      shapes: [crossbones],
      // Need a better sound file for this
      // soundPath: `modules/${constants.modName}/sounds/fumble/crowd-aww.mp3`,
      flat: true,
   });
};
