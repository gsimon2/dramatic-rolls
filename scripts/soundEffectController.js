const mod = 'dramatic-rolls';
const baseSoundPath = `modules/${mod}/sounds`;

// Returns random int between 0 and max (exclusive)
const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};

const critSoundEffectFiles = [
    'audioblocks-magic-poof-spell.mp3',
    'crowd-cheers-and-whistles.mp3',
    'crowd-hooray.mp3',
    'crowd-scream-oh-yeah.mp3',
    'fairy-glitter-shine.mp3',
    'fanfare-short-announce.mp3',
    'fanfare-short-bonus.mp3',
    'ho-ho-ho.mp3',
    'laughing-audience-clapping.mp3',
    'level-complete-magical-sparkle.mp3',
    'magical-twinkle-sparkle-whoosh.mp3'
];

const fumbleSoundEffectFiles = [
    'boing.mp3',
    'car-skidding-out.mp3',
    'cartoon-disappoint.mp3',
    'crowd-aww.mp3',
    'crowd-aww-disappointed.mp3',
    'crowd-scream-oh-no.mp3',
    'fail-error-sound.mp3',
    'fart.mp3',
    'glass-break-large-smash.mp3',
    'power-down.mp3',
    'tire-screech.mp3',
    'video-game-game-over.mp3'
];

const getCritSoundEffect = () => {
    const directoryName = 'crit';
    const fileName = critSoundEffectFiles[getRandomInt(critSoundEffectFiles.length)];
    return `${baseSoundPath}/${directoryName}/${fileName}`;
};

const getFumbleSoundEffect = () => {
    const directoryName = 'fumble';
    const fileName = fumbleSoundEffectFiles[getRandomInt(fumbleSoundEffectFiles.length)];
    return `${baseSoundPath}/${directoryName}/${fileName}`;
};

export default {
    getCritSoundEffect,
    getFumbleSoundEffect
}
