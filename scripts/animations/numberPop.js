// based on Confetti! https://www.kirilv.com/canvas-confetti/
import confetti from "https://cdn.skypack.dev/canvas-confetti";

// document.body.addEventListener("click", () => {
//    confetti({
//       particleCount: 25,
//       spread: 100,
//       startVelocity : 5,
//       origin: { y: 0.4 },
//       colors: ['#4f2b1b', '#8b5f40'],
//    });
// });

function getDistinct(cap, pick) {
   var sample = [];
   const range = Array(cap)
      .fill(0)
      .map((_, i) => i);

   for (var i = 0; i < pick; i++) {
      sample.push(range.splice(Math.random() * range.length, 1));
   }

   return sample;
}

export function animateCount(num) {
   const isCrit = num === 20;
   const isFumble = num === 1;

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

   const colorPicks = getDistinct(
      isFumble ? sadColors.length : happyColors.length,
      2
   );
   const color1 = isFumble
      ? sadColors[colorPicks[0]]
      : happyColors[colorPicks[0]];

   const color2 = isFumble
      ? sadColors[colorPicks[1]]
      : happyColors[colorPicks[1]];

   const tl = gsap.timeline();
   const el = document.querySelector(".counter");

   // Insert color rule into the stylesheet
   const styleSheet = [...document.styleSheets].find((sheet) =>
      sheet.href.includes("dramaticRolls")
   );
   styleSheet.insertRule(
      `.celebrate { background-image: linear-gradient(45deg, ${color2}, ${color1}, ${color2}); filter: drop-shadow(white 1px 1px 0) drop-shadow(${color1} 2px 2px 2px); }`,
      0
   );

   confetti({
      particleCount: isCrit ? 250 : isFumble ? 25 : 0,
      spread: 200,
      startVelocity: isCrit ? 45 : 5,
      origin: { y: isCrit ? 0.4 : 0.68 },
      colors: [color1, color2],
   });

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
