/**
 * Use this to play sounds. If you want to position your sounds, use a {@link SoundSource} instead.
 */
export class SoundPlayer {
  /**
   * @param node The destination node to connect {@link AudioBufferSourceNode AudioBufferSourceNodes} to.
   */
  constructor(node) {
    /** All free sounds (those not played on a channel). */
    this.sounds = [];
    /** All sounds played on a channel. */
    this.channels = new Map();
    this.node = node;
  }
  /**
   * Creates an {@link AudioBufferSourceNode} and adds an "ended" event listener to its node.
   *
   * @param audioBuffer The buffer to play.
   * @param options The options to apply on playback.
   * @returns The new {@link AudioBufferSourceNode}.
   */
  createSourceNode(audioBuffer, options) {
    const sourceNode = new AudioBufferSourceNode(this.node.context, options);
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(this.node);
    sourceNode.start();
    sourceNode.addEventListener("ended", () => this.onSoundEnded(sourceNode));
    return sourceNode;
  }
  /**
   * Play an audio buffer.
   *
   * @param audioBuffer The buffer to play.
   * @param options The options to apply on playback.
   * @returns A new {@link AudioBufferSourceNode}.
   */
  play(audioBuffer, options) {
    const sourceNode = this.createSourceNode(audioBuffer, options);
    this.sounds.push(sourceNode);
    return sourceNode;
  }
  /**
   * Play an audio buffer on a channel.
   * If an {@link AudioBufferSourceNode} is already running on the specified channel, it will be stopped first.
   *
   * @param channel The channel to play the buffer on.
   * @param audioBuffer The buffer to play.
   * @param options The options to apply on playback.
   * @returns A new {@link AudioBufferSourceNode}.
   */
  playOnChannel(channel, audioBuffer, options) {
    const sourceNode = this.createSourceNode(audioBuffer, options);
    const current = this.channels.get(channel);
    current === null || current === void 0 ? void 0 : current.stop();
    this.channels.set(channel, sourceNode);
    return sourceNode;
  }
  /**
   * Stop the {@link AudioBufferSourceNode} on a channel if any is currently playing.
   *
   * @param channel The channel to stop.
   */
  stopChannel(channel) {
    const current = this.channels.get(channel);
    if (current) {
      current.stop();
      this.channels.delete(channel);
    }
  }
  /**
   * Stop all sounds.
   */
  stopAll() {
    for (const sound of this.sounds) sound.stop();
    this.sounds.length = 0;
    for (const sound of this.channels.values()) sound.stop();
    this.channels.clear();
  }
  /**
   * Will be called when an {@link AudioBufferSourceNode} ended.
   *
   * @param sourceNode The {@link AudioBufferSourceNode} node that ended.
   */
  onSoundEnded(sourceNode) {
    const index = this.sounds.indexOf(sourceNode);
    if (index >= 0) {
      this.sounds.splice(index, 1);
      return;
    }
    for (const [key, snd] of this.channels.entries()) {
      if (snd === sourceNode) {
        this.channels.delete(key);
        return;
      }
    }
  }
}
