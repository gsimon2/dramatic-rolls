import confetti from "https://cdn.skypack.dev/canvas-confetti"; // https://www.npmjs.com/package/canvas-confetti
import { getDistinct } from "../utils.js";
import gsap from "/scripts/greensock/esm/all.js";

// document.body.addEventListener("click", () => {
//    // numberPop("20", true, false);
//    // numberFlyInFallDown('Crit!');
//    // numberFontSwitch('Fumble!');
// });

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

const getBasicNumberStyling = (num, colorPicks) => ({
   innerText: num,
   backgroundImage: `radial-gradient(circle, ${colorPicks[0]}, ${colorPicks[1]})`,
   filter: `drop-shadow(${colorPicks[1]} 1px 1px 0) drop-shadow(${colorPicks[0]} 2px 2px 2px)`,
   backgroundClip: "text",
   color: "transparent",
   fontSize: "0vh",
   // fontFamily: "FontAwesome",
   webkitTextStroke: "1px white",
   transformOrigin: "bottom center",
});

const prepAnimation = (className) => {
   const animationId = "dramatic-rolls-animation";
   if (document.getElementById(animationId)) {
      document.getElementById(animationId).remove();
   }

   const animationContainer = document.getElementById("dramatic-rolls-animation-container");
   const el = document.createElement("div");
   el.id = animationId;

   if (className) {
      el.className = className;
   }
   animationContainer.appendChild(el);

   return el;
};

const getFontSize = (num) => {
   return num.toString().length > 2 ? "20vh" : "45vh";
};

// based on Confetti! https://www.kirilv.com/canvas-confetti/
export function numberPop(num, isCrit, isFumble) {
   const el = prepAnimation("dramatic-rolls-counter dramatic-rolls-celebrate");
   const colorPicks = getDistinct(isCrit ? happyColors : sadColors, 2);
   const t1 = gsap.timeline();

   if (isCrit || isFumble) {
      confetti({
         particleCount: isCrit ? 400 : 25,
         spread: 200,
         startVelocity: isCrit ? 45 : 5,
         origin: { y: isCrit ? 0.4 : 0.68 },
         colors: [colorPicks[0], colorPicks[1]],
         angle: isCrit ? 90 : -90,
         scalar: 1.5,
         zIndex: 109,
      });
   }

   t1.set(el, {
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
         scale: num.toString().length > 2 ? 1 : 3,
         "--font-variation-weight": 600,
         ease: "elastic.out(1, 0.2)",
         duration: 1.2,
      })
      .to(el, {
         opacity: 0,
         delay: 1,
         onComplete: () => {
            t1.kill();
            el.remove();
         },
      });
}

export const numberFlyInFallDown = (num, useHappyColors = true) => {
   const el = prepAnimation();
   const t1 = gsap.timeline();
   const colorPicks = getDistinct(useHappyColors ? happyColors : sadColors, 2);

   t1.set(el, {
      ...getBasicNumberStyling(num, colorPicks),
      fontFamily: "FontAwesome",
   })
      .to(el, { fontSize: getFontSize(num), duration: 1, ease: "back.out(4)" })
      .to(el, {
         rotationX: 90,
         onComplete: () => {
            t1.kill();
            el.remove();
         },
      });
};

export const numberFontSwitch = (num, useHappyColors = true) => {
   const el = prepAnimation();
   const t1 = gsap.timeline();
   const colorPicks = getDistinct(useHappyColors ? happyColors : sadColors, 2);

   const fontPool = [
      "FontAwesome",
      "Amiri",
      "Modesto Condensed",
      "Bruno Ace",
      "Gelasio",
      "La Belle Aurore",
      "Roboto",
      "Roboto Mono",
      "Vollkorn",
      "fantasy",
      "system-ui",
      "cursive",
   ];

   const fonts = getDistinct(fontPool, 7);

   t1.set(el, getBasicNumberStyling(num, colorPicks)).to(el, {
      fontSize: getFontSize(num),
      fontFamily: fonts[0],
      duration: 0.25,
   });

   fonts.forEach((font) => {
      t1.to(el, {
         fontFamily: font,
         duration: 0.25,
      });
   });

   t1.to(el, {
      opacity: 0,
      duration: 0.75,
      ease: "power1",
      onComplete: () => {
         t1.kill();
         el.remove();
      },
   });
};
