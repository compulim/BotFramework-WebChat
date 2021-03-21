/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default function warn(message: any | string, ...args: any[]): void {
  // TODO: Implement better warning
  // eslint-disable-next-line no-console
  console.log(...(typeof message === 'string' ? [`webchat-acs: ${message}`, ...args] : [message, ...args]));
}
