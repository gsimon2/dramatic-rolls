import confetti from "https://cdn.skypack.dev/canvas-confetti";
import soundEffectController from "../soundEffectController.js";
import constants from "../../constants.js";

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
];

document.body.addEventListener("click", () => {
   fireConfetti2();
});

// Replace the other confetti animation with this one.
// Get more colors
// Try big pop sound?
export const fireConfetti2 = () => {
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
            particleCount: 250,
            spread: 100,
            startVelocity: 75,
            origin: { y: 0.9, x: point.x },
            colors: [
               colors[Math.floor(Math.random() * colors.length)],
               colors[Math.floor(Math.random() * colors.length)],
               colors[Math.floor(Math.random() * colors.length)],
            ],
            angle: point.angle,
            scalar: 1.5,
         });
      }, 200 * index);
   });
};
