import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import createDebug from '../../utils/debug';
import fromWho from '../../utils/fromWho';
import useActivities from '../useActivities';
import useForceRender from './useForceRender';
import useTrackEvent from '../useTrackEvent';
import WebChatInputContext from './WebChatInputContext';

let debug;

const InputComposer = ({ children, sendEvent, sendFiles, sendMessage, sendMessageBack, sendPostBack }) => {
  debug || (debug = createDebug('<InputComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const [inputMode, setInputMode] = useState('keyboard'); // "keyboard" or "speech".
  const [renderedActivities] = useActivities('render');
  const [sendBoxValue, setSendBoxValue] = useState('');
  const activityForSuggestedActionsRef = useRef();
  const forceRender = useForceRender();
  const suggestedActionsRef = useRef([]);
  const trackEvent = useTrackEvent();

  const patchedSendFiles = useMemo(
    () =>
      sendFiles &&
      (files => {
        files &&
          files.length &&
          trackEvent('sendFiles', {
            numFiles: files.length,
            // eslint-disable-next-line no-magic-numbers
            sumSizeInKB: Math.round(files.reduce((total, { size }) => total + size, 0) / 1024)
          });

        return sendFiles;
      }),
    [sendFiles, trackEvent]
  );

  // TODO: We should move sendXxx to chat adapter.
  // TODO: Consider deprecating "method" options, by asking end-dev to call setter of useInputMode() themselves.
  const patchedSendMessage = useMemo(
    () =>
      sendMessage &&
      // TODO: Why do we have channelData here?
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

  // TODO: We should move sendXxx to chat adapter.
  const patchedSendPostBack = useMemo(
    () =>
      sendPostBack &&
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

  // TODO: This is not a good way to see if the activity should be rendered or not.
  const lastRenderedActivity = useMemo(() => {
    for (let index = renderedActivities.length - 1; index >= 0; index--) {
      const activity = renderedActivities[index];

      if (activity.type === 'message') {
        return activity;
      }
    }
  }, [renderedActivities]);

  if (lastRenderedActivity !== activityForSuggestedActionsRef.current) {
    activityForSuggestedActionsRef.current = lastRenderedActivity;

    if (
      lastRenderedActivity &&
      lastRenderedActivity.suggestedActions &&
      lastRenderedActivity.suggestedActions.actions &&
      fromWho(lastRenderedActivity) === 'others'
    ) {
      suggestedActionsRef.current = lastRenderedActivity.suggestedActions.actions || [];
    } else {
      suggestedActionsRef.current = [];
    }
  }

  const clearSuggestedActions = useCallback(() => {
    suggestedActionsRef.current = undefined;

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
      sendBoxValue,
      sendEvent,
      setInputMode,
      setSendBoxValue,
      submitSendBox,
      suggestedActionsRef
    ]
  );

  return <WebChatInputContext.Provider value={inputContext}>{children}</WebChatInputContext.Provider>;
};

InputComposer.defaultProps = {
  children: undefined,
  sendEvent: undefined,
  sendFiles: undefined,
  sendMessage: undefined,
  sendMessageBack: undefined,
  sendPostBack: undefined
};

InputComposer.propTypes = {
  children: PropTypes.any,
  sendEvent: PropTypes.func,
  sendFiles: PropTypes.func,
  sendMessage: PropTypes.func,
  sendMessageBack: PropTypes.func,
  sendPostBack: PropTypes.func
};

export default InputComposer;
