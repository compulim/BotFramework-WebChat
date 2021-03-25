// TODO: Should we move this bridge to bf-wc-core?

import {
  connect as createConnectAction,
  createStore,
  disconnect as createDisconnectAction,
  emitTypingIndicator as createEmitTypingIndicatorAction,
  postActivity as createPostActivityAction
} from 'botframework-webchat-core';

import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import updateIn from 'simple-update-in';

import getMetadata from '../../utils/getMetadata';
import mime from '../../utils/mime-wrapper';
import observableToPromise from '../utils/observableToPromise';
import useMemoAll from './useMemoAll';
import WebChatReduxContext, { useDispatch, useSelector } from './WebChatReduxContext';

function chainUpdateIn(target, chain) {
  return chain.reduce((target, [path, updater]) => updateIn(target, path, updater), target);
}

function useSelectMap(array, data, selector, updater) {
  const entries = useMemoAll(selector, select => array.map(element => select(element, data)));

  return useMemoAll(updater, update => entries.map(entry => update(entry)), [entries]);
}

function usePatchActivities(directLineActivities, styleOptions) {
  return useSelectMap(
    directLineActivities,
    styleOptions,
    useCallback((directLineActivity, { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials }) => {
      const { channelData: { clientActivityID } = {} } = directLineActivity;
      const { who } = getMetadata(directLineActivity);
      const self = who === 'self';

      return [
        directLineActivity,
        self ? userAvatarImage : botAvatarImage,
        self ? userAvatarInitials : botAvatarInitials,
        clientActivityID || directLineActivity.id,
        who
      ];
    }, []),
    useCallback(
      ([directLineActivity, avatarImage, avatarInitials, key, who]) =>
        chainUpdateIn(directLineActivity, [
          [['channelData', 'webchat:avatar:image'], () => avatarImage],
          [['channelData', 'webchat:avatar:initials'], () => avatarInitials],
          [['channelData', 'webchat:key'], () => key],
          [['channelData', 'webchat:who'], () => who]
        ]),
      []
    )
  );
}

const InternalLegacyChatAdapterBridge = ({
  children,
  directLine,
  // TODO: Move "sendTimeout" to chat adapter.
  // sendTimeout,
  styleOptions,
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
      // TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
      dispatch(createDisconnectAction());
    };
  }, [dispatch, directLine, userIdFromProps, usernameFromProps]);

  const { id: userId, name: username } = useSelector(({ user }) => user);
  const activities = useSelector(({ activities }) => activities);
  const directLineReferenceGrammarId = useSelector(({ referenceGrammarId }) => referenceGrammarId);
  const notifications = useSelector(({ notifications }) => notifications);
  const typingUsers = useSelector(({ typing }) => typing);

  const patchedActivities = usePatchActivities(activities, styleOptions);

  const emitTypingIndicator = useCallback(() => {
    dispatch(createEmitTypingIndicatorAction());
  }, [dispatch]);

  const getDirectLineOAuthCodeChallenge = useMemo(
    () => directLine && directLine.getSessionId && (() => observableToPromise(directLine.getSessionId())),
    [directLine]
  );

  const postActivity = useCallback(
    activity => {
      // TODO: Convert to async function
      //       POST_ACTIVITY_REJECTED = reject
      //       POST_ACTIVITY_FULFILLED = resolve
      // TODO: We should be diligent on what channelData to send, should we strip out "webchat:*"?
      dispatch(createPostActivityAction(activity));
    },
    [dispatch]
  );

  const resendActivity = useCallback(() => {
    throw new Error('not implemented');
  }, []);

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
      activities: patchedActivities,
      directLineReferenceGrammarId,
      emitTypingIndicator,
      getDirectLineOAuthCodeChallenge,
      notifications,
      resendActivity,
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
  styleOptions: PropTypes.shape({
    botAvatarImage: PropTypes.string,
    botAvatarInitials: PropTypes.string,
    userAvatarImage: PropTypes.string,
    userAvatarInitials: PropTypes.string
  }).isRequired,
  userId: PropTypes.string,
  username: PropTypes.string
};

export default LegacyChatAdapterBridge;
