/* eslint no-console: ["off"] */

import styleConsole from './styleConsole';

const { NODE_ENV } = (process && process.env) || {};

function format({ backgroundColor, color }, category, arg0, ...args) {
  return [`%c${category}%c ${arg0}`, ...styleConsole(backgroundColor, color), ...args];
}

export default function debug(
  category,
  { backgroundColor = 'green', color = 'white', force = NODE_ENV === 'development' } = {}
) {
  if (!force) {
    return () => 0;
  }

  return (...args) => {
    if (!args.length) {
      return;
    }

    const [arg0] = args;

    if (typeof arg0 === 'function') {
      args = arg0();
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
