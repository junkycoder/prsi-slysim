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
 * @param {Object} options { gain = .5, loop = false }
 * @returns Methods: play, stop
 */
export const createSound = async (soundPath, { gain = 1 } = {}) => {
  const context = createAudioContext();
  const source = new SoundSource(context.destination, { gain });
  const buffer = await loadAudioBuffer(context, soundPath);

  const listener = createSoundListener(context);
  listener.setPosition(0, -1, 0);

  return {
    play: ({ loop = false, position = [0, 1, 0] }) =>
      new Promise((resolve) => {
        source.setPosition(...position);
        source.play(buffer, { loop }).addEventListener("ended", resolve);
      }),
    stop: () => source.stopAll(),
  };
};

let promises = new Map();
let soundPath = "/sounds/";

export default {
  setSoundsPath(path) {
    soundPath = path;
  },
  enable(name, enabled = true, { autoplay = false, loop = false } = {}) {
    if (!promises.has(name)) {
      promises.set(name, createSound(soundPath + name, { loop }));
    }
    const promise = promises.get(name);
    if (promise) {
      promise.enabled = enabled;

      if (!enabled) {
        promise.then((s) => s.stop());
      } else if (autoplay) {
        promise.then((s) => s.play({ loop }));
      }
    }
  },
  enableAll(names, enabled = true, { loop = false, autoplay = false } = {}) {
    for (let name of names) {
      this.enable(name, enabled, autoplay, { loop });
    }
  },
  async play(name, { loop = false, gain = 1 } = {}) {
    if (!promises.has(name)) {
      promises.set(name, createSound(soundPath + name, { gain }));
    }
    const promise = promises.get(name);
    if (promise.enabled === false) return false; // sound is disabled
    return (await promise).play({ loop });
  },
  async playTimes(name, times, opts) {
    for (let i = 0; i < times; i++) {
      await this.play(name, opts);
    }
  },
};

export const toPositionInCircle = ({ index, length }) => {
  // TODO calculate player position around of circle tabel
  const x = 0;
  const y = 1;
  const z = 1;
  return [x, y, z];
};
