export default function deprecation(message: string, date: string): () => void {
  let warned;

  return () => {
    if (!warned) {
      console.warn(`botframework-webchat: [DEPRECATION] ${message} This feature will be remove on or after ${date}.`);
      warned = true;
    }
  };
}
