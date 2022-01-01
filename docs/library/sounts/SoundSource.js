import { SoundPlayer } from "./SoundPlayer.js";

/**
 * A sound source is a way to position and orient sounds in the world.
 * If you don't need to position your sounds, you can work with a {@link SoundPlayer} instead.
 */
export class SoundSource extends SoundPlayer {
  /**
   * @param destination The destination node to connect to.
   * @param options The options to apply.
   */
  constructor(destination, options) {
    super(destination.context.createPanner());
    const gain = options === null || options === void 0 ? void 0 : options.gain;
    if (gain !== undefined) {
      this.gainNode = destination.context.createGain();
      this.gainNode.gain.value = gain;
      this.gainNode.connect(destination);
      this.node.connect(this.gainNode);
    } else {
      this.node.connect(destination);
    }
    if (options) {
      if (options.coneInnerAngle !== undefined)
        this.node.coneInnerAngle = options.coneInnerAngle;
      if (options.coneOuterAngle !== undefined)
        this.node.coneOuterAngle = options.coneOuterAngle;
      if (options.coneOuterGain !== undefined)
        this.node.coneOuterGain = options.coneOuterGain;
      if (options.maxDistance !== undefined)
        this.node.maxDistance = options.maxDistance;
      if (options.refDistance !== undefined)
        this.node.refDistance = options.refDistance;
      if (options.distanceModel)
        this.node.distanceModel = options.distanceModel;
      if (options.panningModel) this.node.panningModel = options.panningModel;
      if (options.rolloffFactor !== undefined)
        this.node.rolloffFactor = options.rolloffFactor;
    }
  }
  /**
   * Set the gain (~volume). Only works if this instance has been configured with again!
   *
   * @param gain The new value.
   */
  setGain(gain) {
    if (!this.gainNode)
      console.error(
        "Trying to set gain on an emitter, which has not been configured with gain!"
      );
    else this.gainNode.gain.value = gain;
  }
  /**
   * Set the position of this source.
   *
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @param z The z-coordinate.
   */
  setPosition(x, y, z) {
    this.node.positionX.value = x;
    this.node.positionY.value = y;
    this.node.positionZ.value = z;
  }
  /**
   * Set the orientation of this source. Only relevant if you also configured a cone.
   *
   * @param x The x-direction.
   * @param y The y-direction.
   * @param z The z-direction.
   */
  setOrientation(x, y, z) {
    this.node.orientationX.value = x;
    this.node.orientationY.value = y;
    this.node.orientationZ.value = z;
  }
}
