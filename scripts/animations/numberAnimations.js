import confetti from "https://cdn.skypack.dev/canvas-confetti"; // https://www.npmjs.com/package/canvas-confetti
import { getDistinct } from "../utils.js";

document.body.addEventListener("click", () => {
   // numberPop(20, true, false);
   // numberFlyInFallDown(20);
});

const happyColors = [
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

const sadColors = [
   "#4f2b1b",
   "#655143",
   "#2d1200",
   "#402a1e",
   "#8b5f40",
   "#515817",
   "#6f2e2e",
];

const prepAnimation = (className) => {
   if (document.getElementById("animation")) {
      document.getElementById("animation").remove();
   }

   const animationContainer = document.getElementById("animation-container");
   const el = document.createElement("div");
   el.id = "animation";

   if (className) {
      el.className = className;
   }
   animationContainer.appendChild(el);

   return el;
}

// based on Confetti! https://www.kirilv.com/canvas-confetti/
export function numberPop(num, isCrit, isFumble) {
   const el = prepAnimation("counter celebrate");
   const colorPicks = getDistinct(isCrit ? happyColors : sadColors, 2);
   const tl = gsap.timeline();

   if (isCrit || isFumble) {
      confetti({
         particleCount: isCrit ? 400 : 25,
         spread: 200,
         startVelocity: isCrit ? 45 : 5,
         origin: { y: isCrit ? 0.4 : 0.68 },
         colors: [colorPicks[0], colorPicks[1]],
         angle: isCrit ? 90 : -90,
         scalar: 1.5,
      });
   }

   tl.set(el, {
      opacity: 1,
      backgroundImage: `linear-gradient(45deg, ${colorPicks[1]}, ${colorPicks[0]}, ${colorPicks[1]})`,
      filter: `drop-shadow(white 1px 1px 0) drop-shadow(${colorPicks[0]} 2px 2px 2px)`,
   })
      .fromTo(
         el,
         {
            innerText: num,
            "--font-variation-weight": 300,
            scale: 0.8,
         },
         {
            duration: 0.0,
            ease: "linear",
         }
      )
      .to(el, {
         scale: 3,
         "--font-variation-weight": 600,
         ease: "elastic.out(1, 0.2)",
         duration: 1.2,
      })
      .to(el, {
         opacity: 0,
         delay: 1,
         onComplete: () => {
            tl.kill();
            el.remove();
         },
      });
}

export const numberFlyInFallDown = (num, useHappyColors = true) => {
   const el = prepAnimation();
   const t1 = gsap.timeline();
   const colorPicks = getDistinct(useHappyColors ? happyColors : sadColors, 2);

   t1.set(el, {
      innerText: num,
      backgroundImage: `radial-gradient(circle, ${colorPicks[0]}, ${colorPicks[1]})`,
      filter: `drop-shadow(${colorPicks[1]} 1px 1px 0) drop-shadow(${colorPicks[0]} 2px 2px 2px)`,
      backgroundClip: "text",
      color: "transparent",
      fontSize: "0vh",
      fontFamily: "FontAwesome",
      webkitTextStroke: "1px white",
      transformOrigin: "bottom center",
   })
      .to(el, { fontSize: "45vh", duration: 1, ease: "back.out(4)" })
      .to(el, {
         rotationX: 90,
         onComplete: () => {
            t1.kill();
            el.remove();
         },
      });
};
