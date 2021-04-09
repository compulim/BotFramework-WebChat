export default function createDefaultCardActionMiddleware() {
  return ({ sendMessage, sendMessageBack, sendPostBack }) => next => (...args) => {
    const [
      {
        cardAction: { displayText, text, type, value }
      }
    ] = args;

    switch (type) {
      case 'imBack':
        if (typeof value === 'string') {
          sendMessage(value);
        } else {
          throw new Error('cannot send "imBack" with a non-string value');
        }

        break;

      case 'messageBack':
        sendMessageBack(value, text, displayText);

        break;

      case 'postBack':
        sendPostBack(value);

        break;

      default:
        return next(...args);
    }
  };
}
