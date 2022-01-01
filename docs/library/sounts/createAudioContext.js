export function createAudioContext(options) {
  const context = new AudioContext(options);
  if (context.state === "suspended") {
    const listener = () => {
      context.resume();
      window.removeEventListener("click", listener);
      window.removeEventListener("keydown", listener);
    };
    window.addEventListener("click", listener);
    window.addEventListener("keydown", listener);
  }
  return context;
}
