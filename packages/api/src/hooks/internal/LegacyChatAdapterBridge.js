// TODO: Should we move this bridge to bf-wc-core?

import {
  connect as createConnectAction,
  createStore,
  disconnect as createDisconnectAction,
  emitTypingIndicator as createEmitTypingIndicatorAction,
  postActivity as createPostActivityAction
} from 'botframework-webchat-core';

import { Provider } from 'react-redux';
import mime from '../../utils/mime-wrapper';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';

import WebChatReduxContext, { useDispatch, useSelector } from './WebChatReduxContext';

const InternalLegacyChatAdapterBridge = ({
  children,
  directLine,
  userId: userIdFromProps,
  username: usernameFromProps
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      createConnectAction({
        directLine,
        userID: userIdFromProps,
        username: usernameFromProps
      })
    );

    return () => {
      /**
       * @todo TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
       */
      dispatch(createDisconnectAction());
    };
  }, [dispatch, directLine, userIdFromProps, usernameFromProps]);

  const { id: userId, name: username } = useSelector(({ user }) => user);
  const activities = useSelector(({ activities }) => activities);
  // TODO: Move connectivityStatus to notification
  const connectivityStatus = useSelector(({ connectivityStatus }) => connectivityStatus);
  const lastTypingAt = useSelector(({ lastTypingAt }) => lastTypingAt);
  const notifications = useSelector(({ notifications }) => notifications);
  const typingUsers = useSelector(({ typing }) => typing);

  const emitTypingIndicator = useCallback(() => {
    dispatch(createEmitTypingIndicatorAction());
  }, [dispatch]);

  const postActivity = useCallback(
    activity => {
      // TODO: Convert to async function
      //       POST_ACTIVITY_REJECTED = reject
      //       POST_ACTIVITY_FULFILLED = resolve
      dispatch(createPostActivityAction(activity));
    },
    [dispatch]
  );

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
        return postActivity({
          attachments: [].map.call(files, ({ name, thumbnail, url }) => ({
            contentType: mime.getType(name) || 'application/octet-stream',
            contentUrl: url,
            name,
            thumbnailUrl: thumbnail
          })),
          channelData: {
            // TODO: Rename to "webchat:attachment-sizes"
            attachmentSizes: [].map.call(files, ({ size }) => size)
          },
          type: 'message'
        });
      }
    },
    [postActivity]
  );

  const sendMessage = useCallback(
    text =>
      postActivity({
        text,
        textFormat: 'plain',
        type: 'message'
      }),
    [postActivity]
  );

  const sendMessageBack = useCallback(
    (value, text, displayText) =>
      postActivity({
        channelData: {
          // TODO: Rename to "webchat:message-back:display-text"
          messageBack: {
            displayText
          }
        },
        text,
        type: 'message',
        value
      }),
    [postActivity]
  );

  const sendPostBack = useCallback(
    value =>
      postActivity({
        channelData: {
          // TODO: Rename to "webchat:post-back"
          postBack: true
        },
        text: typeof value === 'string' ? value : undefined,
        type: 'message',
        value: typeof value !== 'string' ? value : undefined
      }),
    [postActivity]
  );

  return (
    children &&
    children({
      activities,
      connectivityStatus,
      emitTypingIndicator,
      lastTypingAt,
      notifications,
      sendEvent,
      sendFiles,
      sendMessage,
      sendMessageBack,
      sendPostBack,
      typingUsers,
      userId,
      username
    })
  );
};

InternalLegacyChatAdapterBridge.defaultProps = {
  children: undefined,
  userId: undefined,
  username: undefined
};

InternalLegacyChatAdapterBridge.propTypes = {
  children: PropTypes.func,
  directLine: PropTypes.any.isRequired,
  userId: PropTypes.string,
  username: PropTypes.string
};

const LegacyChatAdapterBridge = ({ children, directLine, store, userId, username }) => {
  const memoizedStore = useMemo(() => store || createStore(), [store]);

  return (
    <Provider context={WebChatReduxContext} store={memoizedStore}>
      <InternalLegacyChatAdapterBridge directLine={directLine} userId={userId} username={username}>
        {children}
      </InternalLegacyChatAdapterBridge>
    </Provider>
  );
};

LegacyChatAdapterBridge.defaultProps = {
  children: undefined,
  store: undefined,
  userId: undefined,
  username: undefined
};

LegacyChatAdapterBridge.propTypes = {
  children: PropTypes.func,
  directLine: PropTypes.any.isRequired,
  store: PropTypes.any,
  userId: PropTypes.string,
  username: PropTypes.string
};

export default LegacyChatAdapterBridge;
