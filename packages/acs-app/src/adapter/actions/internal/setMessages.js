const SET_MESSAGES = 'ACS/SET_MESSAGES';

export { SET_MESSAGES };

export default function setMessages(messages, { identity }) {
  return {
    meta: { identity },
    payload: messages,
    type: SET_MESSAGES
  };
}
