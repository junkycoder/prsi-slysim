export declare type PlayOptions = Omit<AudioBufferSourceOptions, "buffer">;
/**
 * Use this to play sounds. If you want to position your sounds, use a {@link SoundSource} instead.
 */
export declare class SoundPlayer<T extends AudioNode = AudioNode> {
    /**
     * The destination node to connect {@link AudioBufferSourceNode AudioBufferSourceNodes} to.
     * In the case of a {@link SoundSource}, this will be the panner node.
     */
    readonly node: T;
    /** All free sounds (those not played on a channel). */
    protected readonly sounds: AudioBufferSourceNode[];
    /** All sounds played on a channel. */
    protected readonly channels: Map<string, AudioBufferSourceNode>;
    /**
     * @param node The destination node to connect {@link AudioBufferSourceNode AudioBufferSourceNodes} to.
     */
    constructor(node: T);
    /**
     * Creates an {@link AudioBufferSourceNode} and adds an "ended" event listener to its node.
     *
     * @param audioBuffer The buffer to play.
     * @param options The options to apply on playback.
     * @returns The new {@link AudioBufferSourceNode}.
     */
    protected createSourceNode(audioBuffer: AudioBuffer, options?: PlayOptions): AudioBufferSourceNode;
    /**
     * Play an audio buffer.
     *
     * @param audioBuffer The buffer to play.
     * @param options The options to apply on playback.
     * @returns A new {@link AudioBufferSourceNode}.
     */
    play(audioBuffer: AudioBuffer, options?: PlayOptions): AudioBufferSourceNode;
    /**
     * Play an audio buffer on a channel.
     * If an {@link AudioBufferSourceNode} is already running on the specified channel, it will be stopped first.
     *
     * @param channel The channel to play the buffer on.
     * @param audioBuffer The buffer to play.
     * @param options The options to apply on playback.
     * @returns A new {@link AudioBufferSourceNode}.
     */
    playOnChannel(channel: string, audioBuffer: AudioBuffer, options?: PlayOptions): AudioBufferSourceNode;
    /**
     * Stop the {@link AudioBufferSourceNode} on a channel if any is currently playing.
     *
     * @param channel The channel to stop.
     */
    stopChannel(channel: string): void;
    /**
     * Stop all sounds.
     */
    stopAll(): void;
    /**
     * Will be called when an {@link AudioBufferSourceNode} ended.
     *
     * @param sourceNode The {@link AudioBufferSourceNode} node that ended.
     */
    protected onSoundEnded(sourceNode: AudioBufferSourceNode): void;
}
