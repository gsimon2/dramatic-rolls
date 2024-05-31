// Copy pasted and modified from this codepen: https://codepen.io/anthonygreco/pen/PGPVJz
import gsap, {Physics2DPlugin} from "/scripts/greensock/esm/all.js";
import constants from "../constants.js";
gsap.registerPlugin(Physics2DPlugin);

var emitterSize = 20,
dotSizeMin = 10,
dotSizeMax = 15,
gravity = 0.7,
explosionQuantity = 6,
emitter = document.querySelector('#interface'),
explosions = [],
currentExplosion = 0,
container, i;

function createExplosion(container) {
  var tl = gsap.timeline({paused: true}),
  speed = getRandom(8, 14),
  dotQuantity = getRandom(100, 160),
  dots = [],
  angle, duration, length, dot, i, size, r, g, b;
  for (i = 0; i < dotQuantity; i++) {
    dot = document.createElement('div');
    dots.push(dot);
    dot.className = 'dramatic-rolls-dot';
    r = getRandom(30, 255);
    g = getRandom(30, 230);
    b = getRandom(30, 230);
    gsap.set(dot, {
      backgroundColor: 'rgb('+r+','+g+','+b+')',
      visibility: 'hidden'
    });
    size = getRandom(dotSizeMin, dotSizeMax);
    container.appendChild(dot);
    angle = getRandom(0.65, 0.85) * Math.PI * 2; // a vector pointed up
    // get maximum distance from the center, factoring in size of dot, and then pick a random spot along that vector to plot a point
    length = Math.random() * (emitterSize / 2 - size / 2);
    duration = 8 + Math.random();
    // place the dot at a random spot within the emitter, and set its size
    gsap.set(dot, {
      x: Math.cos(angle) * length, 
      y: Math.sin(angle) * length, 
      width: size, 
      height: size, 
      xPercent: -50, 
      yPercent: -50,
      visibility: 'hidden',
      force3D: true
    });
    tl.to(dot, duration / 2, {
      opacity: 0,
      ease: 'rough'
    }, 0).to(dot, {
      duration: duration,
      visibility: 'visible',
      rotationX: '-='+getRandom(720, 1440),
      rotationZ: '+='+getRandom(720, 1440),
      physics2D: {
        angle: angle * 180 / Math.PI, // translate radians to degrees
        velocity: (100 + Math.random() * 250) * speed, // initial velocity
        gravity: 700 * gravity,
        friction: getRandom(0.1, 0.15)
      }
     }, 0).to(dot, 1.25 + Math.random(), {
      opacity: 0
    }, duration / 4);
  }
  // hide the dots at the end for improved performance (better than opacity: 0 because the browser can ignore the elements)
  // console.log('setting', dots);
  tl.set(dots, {visibility: 'hidden'});
  return tl;
}

function explode(element) {
  var bounds = element.getBoundingClientRect(),
  explosion;
  if (++currentExplosion === explosions.length) {
    currentExplosion = 0;
  }
  explosion = explosions[currentExplosion];
  explosion.animation.set(explosion.container, {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2
  });
  explosion.animation.restart();

  foundry.audio.AudioHelper.play(
   {
      src: `modules/${constants.modName}/sounds/confetti/little_pop.mp3`,
      volume: 0.6,
      autoplay: true,
      loop: false,
   },
   true);
}

function getRandom(min, max) {
  var rand = min + Math.random() * (max - min);
  return rand;
}

export function fireConfetti() {
  var intervalCount = 0,
  interval = setInterval(function() {
    if (intervalCount < 5) {
      explode(emitter);
      intervalCount++;
    } else {
      clearInterval(interval);
    }
  }, getRandom(10, 250));
}

export function setupConfetti() {
   const parentContainer = document.createElement('div');
   parentContainer.className = 'dramatic-rolls-confetti-emitter-container';
   document.body.appendChild(parentContainer);
  for (i = 0; i < explosionQuantity; i++) {
    container = document.createElement('div');
    container.className = 'dramatic-rolls-dot-container';
    parentContainer.appendChild(container);
    explosions.push({
      container: container,
      animation: createExplosion(container)
    });
  }
    
//   document.querySelector('body').onclick = function () {
//    fireConfetti();
//   };
}
