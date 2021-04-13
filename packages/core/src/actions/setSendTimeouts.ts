const SET_SEND_TIMEOUTS = 'WEB_CHAT/SET_SEND_TIMEOUTS';

export default function setSendTimeouts(sendTimeout: number, sendTimeoutForAttachments: number) {
  return {
    type: SET_SEND_TIMEOUTS,
    payload: { sendTimeout, sendTimeoutForAttachments }
  };
}

export { SET_SEND_TIMEOUTS };
