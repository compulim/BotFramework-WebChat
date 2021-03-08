const SET_TYPING = 'ACS/SET_TYPING';

export default function setTyping(typing) {
  return {
    payload: typing,
    type: SET_TYPING
  };
}

export { SET_TYPING };
