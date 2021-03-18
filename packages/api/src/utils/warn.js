export default function warn(message, ...args) {
  // TODO: Implement better warning
  // eslint-disable-next-line no-console
  console.log(...(typeof message === 'string' ? [`botframework-webchat: ${message}`, ...args] : [message, ...args]));
}
