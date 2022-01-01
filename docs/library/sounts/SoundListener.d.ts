/**
 * Used to position and orient the AudioListener cross-browser.
 *
 * @see {@link createSoundListener}
 */
export declare abstract class SoundListener {
    readonly node: AudioListener;
    /**
     * @param context The audio context to use.
     */
    constructor(context: AudioContext);
    /**
     * Set the position of this listener.
     * The default is (0, 0, 0).
     *
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param z The z-coordinate.
     */
    abstract setPosition(x: number, y: number, z: number): void;
    /**
     * Set the forward direction of this listener.
     * The default is (0, 0, -1).
     *
     * @param x The x-direction.
     * @param y The y-direction.
     * @param z The z-direction.
     */
    abstract setForward(x: number, y: number, z: number): void;
    /**
     * Set the up direction of this listener.
     * The default is (0, 1, 0).
     *
     * @param x The x-direction.
     * @param y The y-direction.
     * @param z The z-direction.
     */
    abstract setUp(x: number, y: number, z: number): void;
    /**
     * Set the forward and up direction of this listener.
     * The defaults are (0, 0, -1) and (0, 1, 0).
     *
     * @param forwardX The forward x-direction.
     * @param forwardY The forward Y-direction.
     * @param forwardZ The forward Z-direction.
     * @param upX The up x-direction.
     * @param upY The up y-direction.
     * @param upZ The up z-direction.
     */
    abstract setOrientation(forwardX: number, forwardY: number, forwardZ: number, upX: number, upY: number, upZ: number): void;
}
/**
 * Create a sound listener depending on browser support.
 *
 * @param context The audio context to use.
 * @returns A new SoundListener instance.
 * @throws When neither standard nor legacy support was detected for AudioListener.
 */
export declare function createSoundListener(context: AudioContext): SoundListener;
