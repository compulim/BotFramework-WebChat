import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import WebChatSendBoxContext from './internal/WebChatSendBoxContext';

const SendBoxComposer = ({ children, dispatch }) => {
  const [sendBoxValue, setSendBoxValue] = useState('');

  const submitSendBox = useCallback(
    (method = 'keyboard', { channelData } = {}) => {
      if (sendBoxValue) {
        // TODO: Convert to use action creator
        dispatch({
          meta: {
            method
          },
          payload: {
            channelData,
            text: sendBoxValue.trim(),
            textFormat: 'plain',
            type: 'message'
          },
          type: 'CHAT_ADAPTER/POST_ACTIVITY'
        });

        setSendBoxValue('');
      }
    },
    [dispatch, sendBoxValue, setSendBoxValue]
  );

  const sendBoxContext = useMemo(
    () => ({
      sendBoxValue,
      setSendBoxValue,
      submitSendBox
    }),
    [sendBoxValue, setSendBoxValue, submitSendBox]
  );

  return <WebChatSendBoxContext.Provider value={sendBoxContext}>{children}</WebChatSendBoxContext.Provider>;
};

SendBoxComposer.defaultProps = {
  children: undefined
};

SendBoxComposer.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired
};

export default SendBoxComposer;
