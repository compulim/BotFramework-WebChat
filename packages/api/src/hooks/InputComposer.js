import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import createDebug from '../utils/debug';
import fromWho from '../utils/fromWho';
import mime from '../utils/mime-wrapper';
import useActivities from './useActivities';
import useForceRender from './internal/useForceRender';
import useTrackEvent from './useTrackEvent';
import WebChatInputContext from './internal/WebChatInputContext';

let debug;

const InputComposer = ({ children, postActivity }) => {
  debug || (debug = createDebug('<InputComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const [inputMode, setInputMode] = useState('keyboard'); // "keyboard" or "speech".
  const [renderedActivities] = useActivities('render');
  const [sendBoxValue, setSendBoxValue] = useState('');
  const activityForSuggestedActionsRef = useRef();
  const forceRender = useForceRender();
  const suggestedActionsRef = useRef([]);
  const trackEvent = useTrackEvent();

  const sendEvent = useMemo(
    () =>
      postActivity &&
      ((name, value) =>
        postActivity({
          name,
          type: 'event',
          value
        })),
    [postActivity]
  );

  // TODO: We should move sendXxx to chat adapter.
  const sendFiles = useMemo(
    () =>
      postActivity &&
      (files => {
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
      }),
    [postActivity, trackEvent]
  );

  // TODO: We should move sendXxx to chat adapter.
  // TODO: Consider deprecating "method" options, by asking end-dev to call setter of useInputMode() themselves.
  // TODO: Why do we have channelData here?
  const sendMessage = useMemo(
    () =>
      postActivity &&
      ((text, method, { channelData } = {}) => {
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
      }),
    [postActivity]
  );

  // TODO: We should move sendXxx to chat adapter.
  const sendMessageBack = useMemo(
    () =>
      postActivity &&
      ((value, text, displayText, method) =>
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
        )),
    [postActivity]
  );

  // TODO: We should move sendXxx to chat adapter.
  const sendPostBack = useMemo(
    () =>
      postActivity &&
      ((value, method) =>
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
        )),
    [postActivity]
  );

  // TODO: Why we are not using sendMessage but postActivity?
  const submitSendBox = useMemo(
    () =>
      postActivity &&
      ((method, { channelData } = {}) => {
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
      }),
    [postActivity, sendBoxValue, setSendBoxValue]
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
  children: undefined,
  postActivity: undefined
};

InputComposer.propTypes = {
  children: PropTypes.any,
  postActivity: PropTypes.func
};

export default InputComposer;
