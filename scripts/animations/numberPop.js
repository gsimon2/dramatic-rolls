// based on Confetti! https://www.kirilv.com/canvas-confetti/
import confetti from "https://cdn.skypack.dev/canvas-confetti";

// document.body.addEventListener("click", () => {
//    animateCount(20, true, false);
// });

function getDistinct(array, pick) {
   const sample = [];
   const arrayClone = [...array];

   for (var i = 0; i < pick; i++) {
      sample.push(arrayClone.splice(Math.random() * arrayClone.length, 1));
   }

   return sample.flat();
}

export function animateCount(num, isCrit, isFumble) {
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

   const colorPicks = getDistinct(isCrit ? happyColors : sadColors, 2);

   const tl = gsap.timeline();
   const el = document.querySelector(".counter");

   // Insert color rule into the stylesheet
   const styleSheet = [...document.styleSheets].find((sheet) =>
      sheet.href.includes("dramaticRolls")
   );
   styleSheet.insertRule(
      `.celebrate { background-image: linear-gradient(45deg, ${colorPicks[1]}, ${colorPicks[0]}, ${colorPicks[1]}); filter: drop-shadow(white 1px 1px 0) drop-shadow(${colorPicks[0]} 2px 2px 2px); }`,
      0
   );

   if (isCrit || isFumble) {
      confetti({
         particleCount: isCrit ? 250 : 25,
         spread: 200,
         startVelocity: isCrit ? 45 : 5,
         origin: { y: isCrit ? 0.4 : 0.68 },
         colors: [colorPicks[0], colorPicks[1]],
         angle: isCrit ? 90 : -90,
         scalar: 1.5,
      });
   }

   tl.set(el, { opacity: 1 })
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
            styleSheet.deleteRule(0);
         },
      });
}

export function setupNumberPop() {
   const parentContainer = document.createElement("div");
   const counter = document.createElement("div");
   parentContainer.className = "number-pop-container";
   counter.className = "counter celebrate";
   document.body.appendChild(parentContainer);
   parentContainer.appendChild(counter);
}
