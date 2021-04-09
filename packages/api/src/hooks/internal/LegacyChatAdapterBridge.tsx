// TODO: Should we move this bridge to bf-wc-core?

import {
  Activity,
  connect as createConnectAction,
  createStore,
  disconnect as createDisconnectAction,
  emitTypingIndicator as createEmitTypingIndicatorAction,
  getMetadata,
  Notifications,
  postActivity as createPostActivityAction,
  updateMetadata
} from 'botframework-webchat-core';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import { default as WebChatReduxContext, useDispatch, useSelector } from './WebChatReduxContext';
import diffMap from '../../utils/diffMap';
import mime from '../../utils/mime-wrapper';
import observableToPromise from '../utils/observableToPromise';
import useForceRender from './useForceRender';
import useMemoAll from './useMemoAll';
import usePrevious from './usePrevious';

const EMIT_TYPING_INTERVAL = 3000;

function useSelectMap<T, U, V>(
  array: T[],
  data: U,
  selector: (entry: T, data?: U) => V,
  updater: (value: V) => T
): T[] {
  const entries = useMemoAll(selector, (select: (entry: T, data?: U) => V) =>
    array.map(element => select(element, data))
  );

  return useMemoAll(updater, (update: (value: V) => V) => entries.map((entry: V) => update(entry)), [entries]);
}

function usePatchActivities(
  activities: Activity[],
  options: {
    botAvatarImage?: string;
    botAvatarInitials?: string;
    userAvatarImage?: string;
    userAvatarInitials?: string;
  }
) {
  const mapCountRef = useRef<number>();
  const selectCountRef = useRef<number>();

  mapCountRef.current = 0;
  selectCountRef.current = 0;

  const selector = useCallback(
    (activity: Activity, { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials }) => {
      const self = activity.from.role === 'user';

      selectCountRef.current++;

      return [activity, self ? userAvatarImage : botAvatarImage, self ? userAvatarInitials : botAvatarInitials];
    },
    []
  );

  const mapper = useCallback(([directLineActivity, avatarImage, avatarInitials]: [Activity, string, string]) => {
    mapCountRef.current++;

    return updateMetadata(directLineActivity, {
      avatarImage,
      avatarInitials
    });
  }, []);

  return useSelectMap(activities, options, selector, mapper);
}

const Activities: FC<{
  botAvatarImage?: string;
  botAvatarInitials?: string;
  children: ({ activities }) => any;
  userAvatarImage?: string;
  userAvatarInitials?: string;
  userID?: string;
}> = ({ botAvatarImage, botAvatarInitials, children, userAvatarImage, userAvatarInitials }) => {
  const activities = useSelector(({ activities }) => activities);
  const options = useMemo(
    () => ({
      botAvatarImage,
      botAvatarInitials,
      userAvatarImage,
      userAvatarInitials
    }),
    [botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials]
  );

  const patchedActivities = usePatchActivities(activities, options);

  return children({ activities: patchedActivities });
};

Activities.defaultProps = {
  botAvatarImage: undefined,
  botAvatarInitials: undefined,
  userAvatarImage: undefined,
  userAvatarInitials: undefined
};

Activities.propTypes = {
  botAvatarImage: PropTypes.string,
  botAvatarInitials: PropTypes.string,
  children: PropTypes.func.isRequired,
  userAvatarImage: PropTypes.string,
  userAvatarInitials: PropTypes.string
};

const TypingUsers: FC<{
  children: ({ typingUsers }: { typingUsers: { [userId: string]: { name?: string } } }) => any;
  typingAnimationDuration: number;
}> = ({ children, typingAnimationDuration }) => {
  const typing: {
    [userId: string]: {
      at: number;
      name: string;
      role: 'bot' | 'user';
    };
  } = useSelector(({ typing }) => typing);

  const typingExcludingSelfAndNotExpired = Object.fromEntries(
    Object.entries(typing).filter(([, { at, role }]) => Date.now() < at + typingAnimationDuration && role !== 'user')
  );

  const prevTypingExcludingSelfAndNotExpired = usePrevious(typingExcludingSelfAndNotExpired) || {};
  const typingUsersRef = useRef({});
  let { current: nextTypingUsers } = typingUsersRef;

  Object.entries(diffMap(prevTypingExcludingSelfAndNotExpired, typingExcludingSelfAndNotExpired)).forEach(
    ([userId, [, to]]) => {
      if (to) {
        // [NO-MULTIUSER]: All typing users are from others, and since we cannot distinguish whether it is "bot" or other users, we assume it is bot.
        nextTypingUsers = updateIn(nextTypingUsers, [userId, 'name'], () => (userId === to.name ? '__BOT__' : to.name));
      } else {
        nextTypingUsers = updateIn(nextTypingUsers, [userId]);
      }
    }
  );

  typingUsersRef.current = nextTypingUsers;

  const nextRefreshAt =
    Math.min(...Object.values(typingExcludingSelfAndNotExpired).map(({ at }) => at)) + typingAnimationDuration;
  const forceRender = useForceRender();

  useEffect(() => {
    const timeout = setTimeout(forceRender, nextRefreshAt);

    return () => clearTimeout(timeout);
  }, [forceRender, nextRefreshAt]);

  return children({ typingUsers: typingUsersRef.current });
};

TypingUsers.propTypes = {
  children: PropTypes.func.isRequired,
  typingAnimationDuration: PropTypes.number.isRequired
};

const EmitTyping: FC<{
  children: ({ emitTyping }: { emitTyping: (started: boolean) => void }) => any;
}> = ({ children }) => {
  const dispatch = useDispatch();
  const dispatchForCallbacksRef = useRef<(action: any) => void>();
  const emitTypingIntervalRef = useRef<NodeJS.Timeout>();

  dispatchForCallbacksRef.current = dispatch;

  const pulseTyping = useCallback(() => {
    const { current: dispatch } = dispatchForCallbacksRef;

    dispatch && dispatch(createEmitTypingIndicatorAction());
  }, [dispatchForCallbacksRef]);

  useEffect(() => () => emitTypingIntervalRef.current && clearInterval(emitTypingIntervalRef.current), [
    emitTypingIntervalRef
  ]);

  const emitTyping = useCallback(
    (started: boolean) => {
      if (started) {
        if (!emitTypingIntervalRef.current) {
          emitTypingIntervalRef.current = setInterval(pulseTyping, EMIT_TYPING_INTERVAL);
        }
      } else {
        if (emitTypingIntervalRef.current) {
          clearInterval(emitTypingIntervalRef.current);
          emitTypingIntervalRef.current = undefined;
        }
      }
    },
    [emitTypingIntervalRef, pulseTyping]
  );

  return children({ emitTyping });
};

EmitTyping.propTypes = {
  children: PropTypes.func.isRequired
};

const ChatAdapterNotifications: FC<{
  children: ({ notifications }: { notifications: Notifications }) => any;
}> = ({ children }) => {
  const notifications = useSelector(({ notifications }) => notifications);
  const welcomeNotification = useMemo(
    () => ({
      id: 'directline:welcome',
      message: 'You are connected via Direct Line protocol.',
      level: 'success'
    }),
    []
  );

  // TODO: Remove this.
  const mergedNotifications = useMemo(
    () => ({
      ...notifications,
      'directline:welcome': welcomeNotification
    }),
    [notifications, welcomeNotification]
  );

  return children({ notifications: mergedNotifications });
};

ChatAdapterNotifications.propTypes = {
  children: PropTypes.func.isRequired
};

const PostActivity: FC<{
  activities: any[];
  children: ({
    resend,
    sendEvent,
    sendFiles,
    sendMessage,
    sendMessageBack,
    sendPostBack
  }: {
    resend: (trackingNumber: string) => string;
    sendEvent: (name: string, value: any) => string;
    sendFiles: (files: any[]) => string; // TODO: We should change it to ArrayBuffer with types.
    sendMessage: (text: string) => string;
    sendMessageBack: (value: any, text: string, displayText: string) => string;
    sendPostBack: (value: any) => string;
  }) => any;
}> = ({ activities, children }) => {
  const activitiesForCallbacksRef = useRef<any[]>();
  const dispatch = useDispatch();

  activitiesForCallbacksRef.current = activities;

  const postActivity = useCallback(
    (activity: any): string => {
      // Use the sendTimeout
      // const { sendTimeout } = styleOptions;

      // TODO: We should be diligent on what channelData to send, should we strip out "webchat:*"?

      // eslint-disable-next-line no-magic-numbers
      const trackingNumber = `t-${random().toString(36).substr(2, 10)}`;

      dispatch(createPostActivityAction(updateMetadata(activity, { trackingNumber })));

      return trackingNumber;
    },
    // [dispatch, styleOptions.sendTimeout]
    [dispatch]
  );

  const resend = useCallback(
    (trackingNumber: string) => {
      const activity = activitiesForCallbacksRef.current.find(
        activity => getMetadata(activity).trackingNumber === trackingNumber
      );

      if (!activity) {
        throw new Error(`Resend cannot find activity with tracking number "${trackingNumber}"`);
      }

      return postActivity(activity);
    },
    [activitiesForCallbacksRef, postActivity]
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
        return postActivity(
          updateMetadata(
            {
              attachments: [].map.call(files, ({ name, thumbnail, url }) => ({
                contentType: mime.getType(name) || 'application/octet-stream',
                contentUrl: url,
                name,
                thumbnailUrl: thumbnail
              })),
              type: 'message'
            },
            {
              attachmentSizes: [].map.call(files, ({ size }) => size)
            }
          )
        );
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

  return children({ resend, sendEvent, sendFiles, sendMessage, sendMessageBack, sendPostBack });
};

PostActivity.propTypes = {
  activities: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired
};

const ConnectedLegacyChatAdapterBridge: FC<{
  children: any;
  directLine: any;
  styleOptions: {
    botAvatarImage?: string;
    botAvatarInitials?: string;
    typingAnimationDuration?: number;
    userAvatarImage?: string;
    userAvatarInitials?: string;
  };
  userId: string;
  username: string;
}> = ({ children, directLine, styleOptions, userId: userIdFromProps, username: usernameFromProps }) => {
  // TODO: We should move the "rectify user ID" code here, so we can get the "user ID" sooner than after we call connect.
  const { id: userId, name: username } = useSelector(({ user }) => user);
  const directLineReferenceGrammarId = useSelector(({ referenceGrammarId }) => referenceGrammarId);
  const dispatch = useDispatch();

  const getDirectLineOAuthCodeChallenge = useMemo(
    () => directLine && directLine.getSessionId && (() => observableToPromise(directLine.getSessionId())),
    [directLine]
  );

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

  return (
    <Activities
      botAvatarImage={styleOptions.botAvatarImage}
      botAvatarInitials={styleOptions.botAvatarInitials}
      userAvatarImage={styleOptions.userAvatarImage}
      userAvatarInitials={styleOptions.userAvatarInitials}
    >
      {({ activities }) => (
        <PostActivity activities={activities}>
          {({ resend, sendEvent, sendFiles, sendMessage, sendMessageBack, sendPostBack }) => (
            <EmitTyping>
              {({ emitTyping }) => (
                <TypingUsers typingAnimationDuration={styleOptions.typingAnimationDuration}>
                  {({ typingUsers }) => (
                    <ChatAdapterNotifications>
                      {({ notifications }) =>
                        children &&
                        children({
                          activities,
                          directLineReferenceGrammarId,
                          emitTyping,
                          getDirectLineOAuthCodeChallenge,
                          notifications,
                          resend,
                          sendEvent,
                          sendFiles,
                          sendMessage,
                          sendMessageBack,
                          sendPostBack,
                          typingUsers,
                          userId,
                          username
                        })
                      }
                    </ChatAdapterNotifications>
                  )}
                </TypingUsers>
              )}
            </EmitTyping>
          )}
        </PostActivity>
      )}
    </Activities>
  );
};

ConnectedLegacyChatAdapterBridge.defaultProps = {
  children: undefined,
  userId: undefined,
  username: undefined
};

ConnectedLegacyChatAdapterBridge.propTypes = {
  children: PropTypes.func,
  directLine: PropTypes.any.isRequired,
  styleOptions: PropTypes.shape({
    botAvatarImage: PropTypes.string,
    botAvatarInitials: PropTypes.string,
    typingAnimationDuration: PropTypes.number,
    userAvatarImage: PropTypes.string,
    userAvatarInitials: PropTypes.string
  }).isRequired,
  userId: PropTypes.string,
  username: PropTypes.string
};

const LegacyChatAdapterBridge: FC<{
  children: any;
  directLine: any;
  store: any;
  styleOptions: {
    botAvatarImage?: string;
    botAvatarInitials?: string;
    typingAnimationDuration?: number;
    userAvatarImage?: string;
    userAvatarInitials?: string;
  };
  userId: string;
  username?: string;
}> = ({ children, directLine, store, styleOptions, userId, username }) => {
  const memoizedStore = useMemo(() => store || createStore(), [store]);

  return (
    <Provider context={WebChatReduxContext} store={memoizedStore}>
      <ConnectedLegacyChatAdapterBridge
        directLine={directLine}
        styleOptions={styleOptions}
        userId={userId}
        username={username}
      >
        {children}
      </ConnectedLegacyChatAdapterBridge>
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
  // TODO: If this is a patched style options, it will never undefined, we can put isRequired here.
  styleOptions: PropTypes.shape({
    botAvatarImage: PropTypes.string,
    botAvatarInitials: PropTypes.string,
    typingAnimationDuration: PropTypes.number,
    userAvatarImage: PropTypes.string,
    userAvatarInitials: PropTypes.string
  }).isRequired,
  userId: PropTypes.string,
  username: PropTypes.string
};

export default LegacyChatAdapterBridge;
