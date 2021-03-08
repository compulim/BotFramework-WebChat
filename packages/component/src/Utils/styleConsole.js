export default function styleConsole(backgroundColor, color = 'white', extraStyles) {
  let styles = `background-color: ${backgroundColor}; border: solid 1px rgba(0, 0, 0, .1); border-radius: 4px; font-weight: bold; padding: 2px 4px;`;

  if (color) {
    styles += ` color: ${color};`;
  }

  if (extraStyles) {
    styles += ' ' + (extraStyles || '');
  }

  return [styles, ''];
}
