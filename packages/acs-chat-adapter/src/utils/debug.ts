/* eslint no-console: ["off"] */

import styleConsole from './styleConsole';

// const { NODE_ENV } = (process && process.env) || {};

function format(
  { backgroundColor, color }: { backgroundColor: string; color: string },
  category: string,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ...args: any[]
): string[] {
  const [arg0, ...argN] = args;

  return [`%c${category}%c ${arg0}`, ...styleConsole(backgroundColor, color), ...argN];
}

export default function debug(
  category: string,
  // { backgroundColor = 'green', color = 'white', force = NODE_ENV === 'development' } = {}
  { backgroundColor = 'green', color = 'white', force = true } = {}
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): (...args: any[]) => void {
  if (!force) {
    return () => 0;
  }

  return (...args) => {
    if (!args.length) {
      return;
    }

    const [arg0] = args;

    if (typeof arg0 === 'function') {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      args = (arg0 as () => any[])();
    }

    const lines = Array.isArray(args[0]) ? args : [args];
    const oneLiner = lines.length === 1;

    lines.forEach((line, index) => {
      if (oneLiner) {
        console.log(...format({ backgroundColor, color }, category, ...line));
      } else if (index) {
        console.log(...(Array.isArray(line) ? line : [line]));
      } else {
        console.groupCollapsed(...format({ backgroundColor, color }, category, ...line));
      }
    });

    oneLiner || console.groupEnd();
  };
}
