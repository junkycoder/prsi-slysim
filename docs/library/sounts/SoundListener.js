/**
 * Used to position and orient the AudioListener cross-browser.
 *
 * @see {@link createSoundListener}
 */
export class SoundListener {
  /**
   * @param context The audio context to use.
   */
  constructor(context) {
    this.node = context.listener;
  }
}

/**
 * Create a sound listener depending on browser support.
 *
 * @param context The audio context to use.
 * @returns A new SoundListener instance.
 * @throws When neither standard nor legacy support was detected for AudioListener.
 */
export function createSoundListener(context) {
  if ("forwardX" in AudioListener.prototype)
    return new StandardSoundListener(context);
  if ("setOrientation" in AudioListener.prototype)
    return new LegacySoundListener(context);
  throw new Error(
    "Neither standard nor legacy support was detected for AudioListener"
  );
}

export class StandardSoundListener extends SoundListener {
  setPosition(x, y, z) {
    this.node.positionX.value = x;
    this.node.positionY.value = y;
    this.node.positionZ.value = z;
  }
  setForward(x, y, z) {
    this.node.forwardX.value = x;
    this.node.forwardY.value = y;
    this.node.forwardZ.value = z;
  }
  setUp(x, y, z) {
    this.node.upX.value = x;
    this.node.upY.value = y;
    this.node.upZ.value = z;
  }
  setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ) {
    this.setForward(forwardX, forwardY, forwardZ);
    this.setUp(upX, upY, upZ);
  }
}
// Firefox does not support forwardX/Y/Z, upX/Y/Z and positionX/Y/Z, so we use setOrientation and setPosition
export class LegacySoundListener extends SoundListener {
  constructor() {
    super(...arguments);
    this.up = [0, 1, 0];
    this.forward = [0, 0, -1];
  }
  setPosition(x, y, z) {
    this.node.setPosition(x, y, z);
  }
  setForward(x, y, z) {
    this.forward = [x, y, z];
    this.node.setOrientation(x, y, z, this.up[0], this.up[1], this.up[2]);
  }
  setUp(x, y, z) {
    this.up = [x, y, z];
    this.node.setOrientation(
      this.forward[0],
      this.forward[1],
      this.forward[2],
      x,
      y,
      z
    );
  }
  setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ) {
    this.up = [upX, upY, upZ];
    this.forward = [forwardX, forwardY, forwardZ];
    this.node.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
  }
}
