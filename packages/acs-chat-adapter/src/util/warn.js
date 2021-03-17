export default function warn(message, ...args) {
  // TODO: Implement better warning
  // eslint-disable-next-line no-console
  console.log(...(typeof message === 'string' ? [`webchat-acs: ${message}`, ...args] : [message, ...args]));
}
