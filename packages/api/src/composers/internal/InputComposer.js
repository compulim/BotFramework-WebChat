import { getMetadata } from 'botframework-webchat-core';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import createDebug from '../../utils/debug';
import InputContext from '../../contexts/internal/InputContext';
import styleConsole from '../../utils/styleConsole';
import useActivities from '../../hooks/useActivities';
import useForceRender from '../../hooks/internal/useForceRender';
import useTrackEvent from '../../hooks/useTrackEvent';

let debug;
let EMPTY_ARRAY;

const InputComposer = ({ children, resend, sendEvent, sendFiles, sendMessage, sendMessageBack, sendPostBack }) => {
  debug || (debug = createDebug('<InputComposer>', { backgroundColor: 'yellow', color: 'black' }));
  EMPTY_ARRAY || (EMPTY_ARRAY = []);

  const [inputMode, setInputMode] = useState('keyboard'); // "keyboard" or "speech".
  const [sendBoxValue, setSendBoxValue] = useState('');
  const [visibleActivities] = useActivities('visible');
  const forceRender = useForceRender();
  const lastVisibleActivityRef = useRef();
  const suggestedActionsRef = useRef(EMPTY_ARRAY);
  const trackEvent = useTrackEvent();

  const patchedSendFiles = useMemo(
    () =>
      sendFiles &&
      // TODO: We need channelData on all sendXxx functions.
      (files => {
        if (!files || !files.length) {
          throw new Error('Must pass an array of files to sendFiles().');
        }

        debug([`Sending %c${files.length}%c files`, ...styleConsole('green')], [{ files, sendFiles }]);

        trackEvent('sendFiles', {
          numFiles: files.length,
          // eslint-disable-next-line no-magic-numbers
          sumSizeInKB: Math.round(files.reduce((total, { size }) => total + size, 0) / 1024)
        });

        return sendFiles(files);
      }),
    [sendFiles, trackEvent]
  );

  const patchedSendMessage = useMemo(
    () =>
      sendMessage &&
      // TODO: We need channelData on all sendXxx functions.
      // ((text, method, { channelData } = {}) => {
      ((text, method) => {
        debug(['Calling sendMessage()'], [{ method, text }]);

        if (method) {
          // TODO: Add deprecation warning
          //       "method" is deprecated, you should call useSetInputMode() instead.
          setInputMode(method);
        }

        return sendMessage(text);
      }),
    [sendMessage, setInputMode]
  );

  const patchedSendMessageBack = useMemo(
    () =>
      sendMessageBack &&
      // TODO: We need channelData on all sendXxx functions.
      ((value, text, displayText, method) => {
        debug(['Calling sendMessageBack()'], [{ displayText, method, text, value }]);

        if (method) {
          // TODO: Add deprecation warning
          //       "method" is deprecated, you should call useSetInputMode() instead.
          setInputMode(method);
        }

        return sendMessageBack(value, text, displayText);
      }),
    [sendMessageBack, setInputMode]
  );

  const patchedSendPostBack = useMemo(
    () =>
      sendPostBack &&
      // TODO: We need channelData on all sendXxx functions.
      ((value, method) => {
        debug(['Calling sendMessageBack()'], [{ method, value }]);

        if (method) {
          // TODO: Add deprecation warning
          //       "method" is deprecated, you should call useSetInputMode() instead.
          setInputMode(method);
        }

        return sendPostBack(value);
      }),
    [sendPostBack, setInputMode]
  );

  const submitSendBox = useMemo(
    () =>
      sendMessage &&
      // TODO: Why do we have channelData here?
      // ((method, { channelData } = {}) => {
      (method => {
        debug(['Calling submitSendBox()'], [{ method, sendBoxValue }]);

        if (method) {
          // TODO: Add deprecation warning
          //       "method" is deprecated, you should call useSetInputMode() instead.
          setInputMode(method);
        }

        const trimmedSendBoxValue = sendBoxValue.trim();

        if (trimmedSendBoxValue) {
          sendMessage(trimmedSendBoxValue);

          setSendBoxValue('');
        }
      }),
    [sendMessage, sendBoxValue, setInputMode, setSendBoxValue]
  );

  const nextLastVisibleActivity = visibleActivities[visibleActivities.length - 1];

  useMemo(() => {
    if (nextLastVisibleActivity !== lastVisibleActivityRef.current) {
      lastVisibleActivityRef.current = nextLastVisibleActivity;

      if (
        nextLastVisibleActivity &&
        nextLastVisibleActivity.suggestedActions &&
        nextLastVisibleActivity.suggestedActions.actions &&
        getMetadata(nextLastVisibleActivity).who !== 'self'
      ) {
        suggestedActionsRef.current = nextLastVisibleActivity.suggestedActions.actions || EMPTY_ARRAY;
      } else {
        suggestedActionsRef.current = EMPTY_ARRAY;
      }
    }
  }, [nextLastVisibleActivity]);

  const clearSuggestedActions = useCallback(() => {
    suggestedActionsRef.current = EMPTY_ARRAY;

    forceRender();
  }, [forceRender, suggestedActionsRef]);

  // debug(
  //   ['Render'],
  //   [
  //     {
  //       activityForSuggestedActions: activityForSuggestedActionsRef.current,
  //       lastRenderedActivity,
  //       suggestedActions: suggestedActionsRef.current
  //     }
  //   ]
  // );

  const inputContext = useMemo(
    () => ({
      clearSuggestedActions,
      inputMode,
      resend,
      sendBoxValue,
      sendEvent,
      sendFiles: patchedSendFiles,
      sendMessage: patchedSendMessage,
      sendMessageBack: patchedSendMessageBack,
      sendPostBack: patchedSendPostBack,
      setInputMode,
      setSendBoxValue,
      submitSendBox,
      suggestedActionsRef
    }),
    [
      clearSuggestedActions,
      inputMode,
      patchedSendFiles,
      patchedSendMessage,
      patchedSendMessageBack,
      patchedSendPostBack,
      resend,
      sendBoxValue,
      sendEvent,
      setInputMode,
      setSendBoxValue,
      submitSendBox,
      suggestedActionsRef
    ]
  );

  return <InputContext.Provider value={inputContext}>{children}</InputContext.Provider>;
};

InputComposer.defaultProps = {
  children: undefined,
  resend: undefined,
  sendEvent: undefined,
  sendFiles: undefined,
  sendMessage: undefined,
  sendMessageBack: undefined,
  sendPostBack: undefined
};

InputComposer.propTypes = {
  children: PropTypes.any,
  resend: PropTypes.func,
  sendEvent: PropTypes.func,
  sendFiles: PropTypes.func,
  sendMessage: PropTypes.func,
  sendMessageBack: PropTypes.func,
  sendPostBack: PropTypes.func
};

export default InputComposer;
