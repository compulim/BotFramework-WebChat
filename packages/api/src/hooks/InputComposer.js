import { emitTypingIndicator as createEmitTypingIndicatorAction } from 'botframework-webchat-core';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import createDebug from '../utils/debug';
import mime from '../utils/mime-wrapper';
import useActivities from './useActivities';
import useForceRender from './internal/useForceRender';
import useTrackEvent from './useTrackEvent';
import WebChatInputContext from './internal/WebChatInputContext';
import fromWho from '../utils/fromWho';
import useSendTypingIndicator from './useSendTypingIndicator';

let debug;

const InputComposer = ({ children, dispatch, postActivity }) => {
  debug || (debug = createDebug('InputComposer'));

  const [activities] = useActivities();
  const [inputMode, setInputMode] = useState('keyboard'); // "keyboard" or "speech".
  const [sendBoxValue, setSendBoxValue] = useState('');
  const activityForSuggestedActionsRef = useRef();
  const forceRender = useForceRender();
  const sendTypingIndicator = useSendTypingIndicator();
  const suggestedActionsRef = useRef([]);
  const trackEvent = useTrackEvent();

  const emitTypingIndicator = useCallback(() => {
    sendTypingIndicator && dispatch(createEmitTypingIndicatorAction());
  }, [dispatch, sendTypingIndicator]);

  const sendEvent = useCallback(
    (name, value) =>
      postActivity({
        name,
        type: 'event',
        value
      }),
    [postActivity]
  );

  const sendFiles = useCallback(
    files => {
      if (files && files.length) {
        const result = postActivity({
          attachments: [].map.call(files, ({ name, thumbnail, url }) => ({
            contentType: mime.getType(name) || 'application/octet-stream',
            contentUrl: url,
            name,
            thumbnailUrl: thumbnail
          })),
          channelData: {
            attachmentSizes: [].map.call(files, ({ size }) => size)
          },
          type: 'message'
        });

        trackEvent('sendFiles', {
          numFiles: files.length,
          // eslint-disable-next-line no-magic-numbers
          sumSizeInKB: Math.round(files.reduce((total, { size }) => total + size, 0) / 1024)
        });

        return result;
      }
    },
    [postActivity, trackEvent]
  );

  // TODO: Consider deprecating "method" options, by asking end-dev to call setter of useInputMode() themselves.
  // TODO: Why do we have channelData here?
  const sendMessage = useCallback(
    (text, method, { channelData } = {}) => {
      debug(['Calling sendMessage()'], [{ method, text }]);

      method && setInputMode(method);

      return postActivity(
        {
          channelData,
          text,
          textFormat: 'plain',
          type: 'message'
        },
        method
      );
    },
    [postActivity]
  );

  const sendMessageBack = useCallback(
    (value, text, displayText, method) =>
      postActivity(
        {
          channelData: {
            messageBack: {
              displayText
            }
          },
          text,
          type: 'message',
          value
        },
        method
      ),
    [postActivity]
  );

  const sendPostBack = useCallback(
    (value, method) =>
      postActivity(
        {
          channelData: {
            postBack: true
          },
          text: typeof value === 'string' ? value : undefined,
          type: 'message',
          value: typeof value !== 'string' ? value : undefined
        },
        method
      ),
    [postActivity]
  );

  const submitSendBox = useCallback(
    (method, { channelData } = {}) => {
      if (sendBoxValue) {
        sendBoxValue &&
          postActivity(
            {
              channelData,
              text: sendBoxValue.trim(),
              textFormat: 'plain',
              type: 'message'
            },
            method
          );

        setSendBoxValue('');
      }
    },
    [postActivity, sendBoxValue, setSendBoxValue]
  );

  // TODO: This is not a good way to see if the activity should be rendered or not.
  const lastRenderedActivity = useMemo(() => {
    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      if (activity.type === 'message') {
        return activity;
      }
    }
  }, [activities]);

  if (lastRenderedActivity !== activityForSuggestedActionsRef.current) {
    activityForSuggestedActionsRef.current = lastRenderedActivity;

    if (
      fromWho(lastRenderedActivity) === 'others' &&
      lastRenderedActivity.suggestedActions &&
      lastRenderedActivity.suggestedActions.actions
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

  debug(
    ['Render'],
    [
      {
        activityForSuggestedActions: activityForSuggestedActionsRef.current,
        lastRenderedActivity,
        suggestedActions: suggestedActionsRef.current
      }
    ]
  );

  const inputContext = useMemo(
    () => ({
      clearSuggestedActions,
      emitTypingIndicator,
      inputMode,
      postActivity,
      sendBoxValue,
      sendEvent,
      sendFiles,
      sendMessage,
      sendMessageBack,
      sendPostBack,
      setInputMode,
      setSendBoxValue,
      submitSendBox,
      suggestedActionsRef
    }),
    [
      clearSuggestedActions,
      emitTypingIndicator,
      inputMode,
      postActivity,
      sendBoxValue,
      sendEvent,
      sendFiles,
      sendMessage,
      sendMessageBack,
      sendPostBack,
      setInputMode,
      setSendBoxValue,
      submitSendBox,
      suggestedActionsRef
    ]
  );

  return <WebChatInputContext.Provider value={inputContext}>{children}</WebChatInputContext.Provider>;
};

InputComposer.defaultProps = {
  children: undefined
};

InputComposer.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  postActivity: PropTypes.func.isRequired
};

export default InputComposer;
