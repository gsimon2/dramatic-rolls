const remoteUrl = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.module.mjs";

const noop = () => {};

let confetti = noop;
let loadPromise = null;

function loadConfetti() {
  if (loadPromise) return loadPromise;

  loadPromise = import(remoteUrl)
    .then((module) => {
      const loaded = module.default ?? module;
      if (typeof loaded === "function") {
        confetti = loaded;
      }
    })
    .catch((error) => {
      console.warn(
        "Dramatic Rolls: failed to load canvas-confetti, confetti animations are disabled.",
        error
      );
    });

  return loadPromise;
}

loadConfetti();

export { confetti, loadConfetti };
