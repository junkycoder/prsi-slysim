import {
  createAudioContext,
  SoundPlayer,
  createSoundListener,
  SoundSource,
} from "/library/sounts/index.js";

/**
 * @param {AudioContext} audioContext
 * @param {string} path
 */
export const loadAudioBuffer = async (audioContext, path) => {
  const response = await fetch(path);
  const data = await response.arrayBuffer();
  return audioContext.decodeAudioData(data);
};

/**
 *
 * @param {string} soundPath
 * @param {Object} options {  gain = .5, loop = false }}
 * @returns Methods: play, stop
 */
export const createSound = async (soundPath, { gain = 1 } = {}) => {
  const context = createAudioContext();
  const source = new SoundSource(context.destination, { gain });
  const buffer = await loadAudioBuffer(context, soundPath);

  const listener = createSoundListener(context);
  listener.setPosition(0, -1, 0);

  return {
    play: ({ loop = false }) => source.play(buffer, { loop }),
    stop: () => source.stopAll(),
  };
};

let sounds = new Map();
let soundPath = "/sounds/";

export default {
  setSoundsPath(path) {
    soundPath = path;
  },
  enable(name, enabled = true, { autoplay = false, loop = false } = {}) {
    const sound = sounds.get(name);
    if (sound) {
      if (!enabled) {
        sound.then((s) => s.stop());
      } else if (autoplay) {
        sound.then((s) => s.play({ loop }));
      }
    }
  },
  enableAll(names, enabled = true, { loop = false, autoplay = false } = {}) {
    for (let name of names) {
      this.enable(name, enabled, autoplay, { loop });
    }
  },
  play(name, { loop = false, gain = 1 } = {}) {
    if (!sounds.has(name)) {
      sounds.set(name, createSound(soundPath + name, { gain }));
    }
    const sound = sounds.get(name);
    sound.then((s) => s.play({ loop }));
  },
  prepare(name, { gain = 1 } = {}) {
    if (sounds.has(name)) return;
    sounds.set(name, createSound(soundPath + name, { gain }));
  },
  prepareAll(names, { gain } = {}) {
    for (let name of names) {
      this.prepare(name, { gain });
    }
  },
};
