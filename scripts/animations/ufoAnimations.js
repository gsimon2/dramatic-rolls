// Based on https://codepen.io/chrisgannon/pen/oqrKNE?editors=0010
const ufo = `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" width="100%">
  <defs>
    <linearGradient id="beamGrad" x1="150" y1="442" x2="150" y2="323" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-opacity="0"/>
      <stop offset="1" stop-color="#fcef29"/>
    </linearGradient>
    <ellipse class="ring" cx="150" cy="260" rx="50" ry="10" fill="none" stroke-width="2" stroke="#5BC0EB" opacity="0.4"/>
    <circle class="beep" id="beep" cx="150" cy="220" r="10" fill="none" stroke-width="1" stroke="#D7263D" opacity="0.31"/>
  </defs>
  <g class="ufo" id="ufo">
    <g class="ufoGroup">
      <polygon class="beam" id="beam" points="133 323 103 442 197 442 167 323 133 323" fill="url(#beamGrad)" opacity="0.3"/>
      <g class="aerialGroup">
        <path class="aerialStalk" d="M148.16,240V224.6a1.9,1.9,0,0,1,1.53-1.9,1.84,1.84,0,0,1,2.15,1.81V240Z" fill="#cae9f7"/>
        <g>
          <path d="M156.55,220.52A6.55,6.55,0,1,1,150,214,6.55,6.55,0,0,1,156.55,220.52Z" fill="#f73e3e"/>
          <path d="M147.16,220.52a6.55,6.55,0,0,1,4.7-6.29A6.74,6.74,0,0,0,150,214a6.56,6.56,0,0,0,0,13.11,6.74,6.74,0,0,0,1.86-.27A6.55,6.55,0,0,1,147.16,220.52Z" fill="#231f20" opacity="0.1"/>
        </g>
      </g>
      <path class="ufoBase" d="M119.58,308.34l-5.46,7.36a1.76,1.76,0,0,0,1.42,2.81h68.89a1.76,1.76,0,0,0,1.4-2.82l-5.55-7.36a1.79,1.79,0,0,0-1.41-.7H121A1.77,1.77,0,0,0,119.58,308.34Z" fill="#304649" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
      <g class="lid">
        <path d="M112.21,279.06h75.58a3.81,3.81,0,0,0,3.76-4.49,42.25,42.25,0,0,0-41.48-34.66,42.15,42.15,0,0,0-29.82,12.4,42.66,42.66,0,0,0-11.8,22.26A3.81,3.81,0,0,0,112.21,279.06Z" fill="#61ccf2" fill-opacity="0.2" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
        <ellipse cx="166.07" cy="253.42" rx="4.53" ry="6.94" transform="translate(-133.25 206.44) rotate(-47.84)" fill="#67daf9" fill-opacity="0.2"/>
      </g>
      <g class="ufoBody">
        <path d="M91.48,296.34H214.37a2.84,2.84,0,0,0,2.09-.83h0a2.84,2.84,0,0,0,.84-2.09,2.81,2.81,0,0,0-.84-2.09l-.14-.14a2.81,2.81,0,0,0-2.09-.84H85.63a2.81,2.81,0,0,0-2.09.84h0a2.81,2.81,0,0,0-.84,2.09,2.84,2.84,0,0,0,.84,2.09l.14.14a2.84,2.84,0,0,0,2.09.83Z" fill="#567C81" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
        <path d="M88.83,290.35H211.17a20.56,20.56,0,0,0-5.85-7.11,19.83,19.83,0,0,0-12.26-4.18h-86a19.83,19.83,0,0,0-12.26,4.18,21,21,0,0,0-6,7.11" fill="#86BCCE" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
        <path d="M88.83,296.34a20.87,20.87,0,0,0,6,7.11,19.77,19.77,0,0,0,12.26,4.18h86a19.77,19.77,0,0,0,12.26-4.18,20.47,20.47,0,0,0,5.85-7.11H88.83" fill="#86BCCE" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
      </g>
      <g class="ufoLightGroup" stroke="#333" fill="#F73E3E" id="ufoLightGroup">
        <circle cx="108.2" cy="284.71" r="2.09"/>
        <circle cx="122.13" cy="284.71" r="2.09"/>
        <circle cx="136.07" cy="284.71" r="2.09"/>
        <circle cx="150" cy="284.71" r="2.09"/>
        <circle cx="163.93" cy="284.71" r="2.09"/>
        <circle cx="177.87" cy="284.71" r="2.09"/>
        <circle cx="191.8" cy="284.71" r="2.09"/>
      </g>
    </g>
  </g>
</svg>
`;

const prepAnimation = () => {
   const animationId = "animation";
   if (document.getElementById(animationId)) {
      document.getElementById(animationId).remove();
   }

   const animationContainer = document.getElementById("animation-container");
   const ufoContainer = document.createElement("div");
   ufoContainer.id = animationId;
   ufoContainer.innerHTML = ufo;
   animationContainer.appendChild(ufoContainer);

   const number = document.createElement("div");
   ufoContainer.appendChild(number);

   return {
      ufoContainer,
      number,
      ufo: document.getElementById("ufo"),
      beam: document.getElementById("beam"),
   };
};

const ufoLights = (tl) => {
   tl.set(".ufoLightGroup circle", { fillOpacity: "0" });
   tl.to(".ufoLightGroup circle", {
      fillOpacity: "1",
      duration: 0.3,
      stagger: 0.3,
      repeat: -1,
      repeatDelay: 2,
   }).to(".ufoLightGroup circle", {
      fillOpacity: "0",
      duration: 0.3,
      stagger: 0.3,
      repeat: -1,
      repeatDelay: 2,
   });
};

const makeBeep = (tl) => {
   var clone = document.getElementById("beep").cloneNode(true);
   document.getElementById("ufo").appendChild(clone);
   tl.fromTo(
      clone,
      0.6,
      {
         attr: {
            r: 2,
         },
         strokeWidth: 10,
      },
      {
         attr: {
            r: 30,
         },
         strokeWidth: 0,
         repeat: -1,
         repeatDelay: 1,
      }
   );
};

export const ufoDropText = (text) => {
   const { ufo, ufoContainer, beam, number } = prepAnimation();
   // Sequencing
   const t1 = gsap.timeline();
   // Repeated animations
   const t2 = gsap.timeline();

   // Initial Setup
   t1.set(ufoContainer, {
      height: "100vh",
      width: "100vw",
      pointerEvents: "none",
   })
      .set(ufo, {
         opacity: 1,
         width: "25vw",
         x: -200,
         y: -200,
         rotateZ: -6,
      })
      .set(beam, { opacity: 0 })
      .set(number, {
         innerText: text,
         opacity: 0,
         position: "absolute",
         // left: "48.5%",
         width: "100%",
         textAlign: "center",
         top: "52%",
         fontSize: text.length > 2 ? "2rem" : "3rem",
         webkitTextStroke: "1px white",
         fontFamily: "FontAwesome",
         color: "green",
         transformOrigin: "bottom center",
      });

   // Animate lights
   makeBeep(t2);
   ufoLights(t2);

   // Fly in
   t1.to(ufo, {
      x: 250,
      y: 0,
      duration: 1,
      ease: "power2.out",
   })
      // Ease back to vertical orientation
      .to(
         ufo,
         {
            rotateZ: 0,
            duration: 2,
            ease: "elastic.out(1.65,0.5)",
         },
         "<65%"
      )
      // Fade in the beam
      .to(
         beam,
         {
            opacity: 0.8,
            duration: 0.75,
            ease: "power2.out",
         },
         "<75%"
      );

   // Drop in number
   t1.to(number, {
      opacity: 1,
      duration: 0.75,
      top: "70%",
      ease: "power3.out",
   });

   // Fade out the beam
   t1.to(beam, {
      opacity: 0,
      duration: 0.75,
      ease: "power2.out",
   })
      // Fly out
      .to(ufo, {
         x: 1000,
         y: -200,
         duration: 2,
         ease: "power2.out",
      })
      // Grow number
      .to(
         number,
         {
            // fontSize: "10rem",
            scale: 4,
            duration: 1.5,
         },
         "<"
      )
      // Rotate and cleanup
      .to(
         ufo,
         {
            rotateZ: -10,
            duration: 2,
            onComplete: () => {
               t1.kill();
               t2.kill();
               ufoContainer.remove();
            },
         },
         "<"
      );
};

// document.body.addEventListener("click", () => {
//    // ufoAnimation('crit!');
//    ufoDropText("20");
// });
