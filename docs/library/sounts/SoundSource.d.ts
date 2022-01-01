import { SoundPlayer } from "./SoundPlayer";
/**
 * Options to use for a sound source.
 */
export interface SoundSourceOptions {
    /** The angle, in degrees, of a cone inside of which there will be no volume reduction. */
    coneInnerAngle?: number;
    /** The angle, in degrees, of a cone outside of which the volume will be reduced by a constant value, defined by the coneOuterGain attribute. */
    coneOuterAngle?: number;
    /**
     * The amount of volume reduction outside the cone defined by the coneOuterAngle attribute.
     * Its default value is 0, meaning that no sound can be heard.
     */
    coneOuterGain?: number;
    /** The algorithm to use to reduce the volume of the audio source as it moves away from the listener. The default value is "inverse". */
    distanceModel?: DistanceModelType;
    /** The maximum distance between the audio source and the listener, after which the volume is not reduced any further. */
    maxDistance?: number;
    /** The spatialization algorithm to use to position the audio in 3D space. */
    panningModel?: PanningModelType;
    /**
     * The reference distance for reducing volume as the audio source moves further from the listener.
     * For distances greater than this the volume will be reduced based on {@link rolloffFactor} and {@link distanceModel}.
     */
    refDistance?: number;
    /** How quickly the volume is reduced as the source moves away from the listener. This value is used by all distance models. */
    rolloffFactor?: number;
    /** The amount of gain to apply. If not specified, a GainNode will not be created and you won't be able to change the gain afterwards! */
    gain?: number;
}
/**
 * A sound source is a way to position and orient sounds in the world.
 * If you don't need to position your sounds, you can work with a {@link SoundPlayer} instead.
 */
export declare class SoundSource extends SoundPlayer<PannerNode> {
    /** The gain node if configured. */
    readonly gainNode?: GainNode;
    /**
     * @param destination The destination node to connect to.
     * @param options The options to apply.
     */
    constructor(destination: AudioNode, options?: SoundSourceOptions);
    /**
     * Set the gain (~volume). Only works if this instance has been configured with again!
     *
     * @param gain The new value.
     */
    setGain(gain: number): void;
    /**
     * Set the position of this source.
     *
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param z The z-coordinate.
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Set the orientation of this source. Only relevant if you also configured a cone.
     *
     * @param x The x-direction.
     * @param y The y-direction.
     * @param z The z-direction.
     */
    setOrientation(x: number, y: number, z: number): void;
}
