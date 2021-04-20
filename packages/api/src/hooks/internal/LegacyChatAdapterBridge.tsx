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
  setSendTimeouts,
  updateMetadata,
  warn
} from 'botframework-webchat-core';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import { default as WebChatReduxContext, useDispatch, useSelector } from './WebChatReduxContext';
import createDebug from '../../utils/debug';
import diffObject from '../../utils/diffObject';
import mime from '../../utils/mime-wrapper';
import observableToPromise from '../utils/observableToPromise';
import styleConsole from '../../utils/styleConsole';
// import useDebounced from './useDebounced';
import useForceRender from './useForceRender';
import useMemoAll from './useMemoAll';
import usePrevious from './usePrevious';

const EMIT_TYPING_INTERVAL = 3000;
let debug;

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
      const { avatarImage, avatarInitials, who } = getMetadata(activity);

      const self = who === 'self';

      selectCountRef.current++;

      return [
        activity,
        // Keep the avatar image/initials if it was set by the bot.
        avatarImage || (self ? userAvatarImage : botAvatarImage),
        avatarInitials || (self ? userAvatarInitials : botAvatarInitials)
      ];
    },
    []
  );

  const mapper = useCallback(([activity, avatarImage, avatarInitials]: [Activity, string, string]) => {
    mapCountRef.current++;

    return updateMetadata(activity, {
      avatarImage,
      avatarInitials
    });
  }, []);

  const result = useSelectMap(activities, options, selector, mapper);

  debug([
    `Patching activities with %c${selectCountRef.current}%c selection and %c${mapCountRef.current}%c mappings, total %c${activities.length}%c activities.`,
    ...styleConsole('green'),
    ...styleConsole('green'),
    ...styleConsole('green')
  ]);

  return result;
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
  // return children({ activities: useDebounced(patchedActivities, 1000) });
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

  Object.entries(diffObject(prevTypingExcludingSelfAndNotExpired, typingExcludingSelfAndNotExpired)).forEach(
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
    debug('%c<TypingUsers>%c is resetting timeout.', ...styleConsole('yellow', 'black'));

    const timeout = setTimeout(() => {
      forceRender();
      debug('%c<TypingUsers>%c is forcing a render.', ...styleConsole('yellow', 'black'));
    }, nextRefreshAt);

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
  activities: Activity[];
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
    sendFiles: (
      files: {
        name: string;
        size?: number;
        thumbnail?: string;
        url: string;
      }[]
    ) => string;
    sendMessage: (text: string) => string;
    sendMessageBack: (value: any, text: string, displayText: string) => string;
    sendPostBack: (value: string) => string;
  }) => any;
}> = ({ activities, children }) => {
  const activitiesForCallbacksRef = useRef<Activity[]>();
  const dispatch = useDispatch();

  activitiesForCallbacksRef.current = activities;

  // TODO: How do we support channelData?
  const postActivity = useCallback(
    (activity: any): string => {
      // If the activity already have a tracking number (e.g. during resend), we will keep the tracking number.
      // eslint-disable-next-line no-magic-numbers
      const { trackingNumber = `t-${random().toString(36).substr(2, 10)}` } = getMetadata(activity);

      dispatch(createPostActivityAction(updateMetadata(activity, { trackingNumber })));

      return trackingNumber;
    },
    [dispatch]
  );

  const resend = useCallback(
    (trackingNumber: string) => {
      const activity = activitiesForCallbacksRef.current.find(
        activity => getMetadata(activity).trackingNumber === trackingNumber
      );

      if (!activity) {
        throw new Error(`Failed to resend; cannot find activity with tracking number "${trackingNumber}".`);
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
      if (!files || !files.length) {
        return warn('🔥🔥🔥 Cannot send files without any files being sent.', { files });
      }

      const filesWithBlobScheme = files.filter(({ url }) => /^blob:/iu.test(url));

      if (filesWithBlobScheme.length !== files.length) {
        warn('🔥🔥🔥 Only files with blob: scheme will be sent.', { files, filesWithBlobScheme });
      }

      debug(`Sending %c${files.length}%c files`, ...styleConsole('green'), { files });

      return postActivity(
        updateMetadata(
          {
            attachments: filesWithBlobScheme.map(({ name, thumbnail, url }) => ({
              contentType: mime.getType(name) || 'application/octet-stream',
              contentUrl: url,
              name,
              thumbnailUrl: thumbnail
            })),
            type: 'message'
          },
          {
            attachmentSizes: filesWithBlobScheme.map(({ size }) => size)
          }
        )
      );
    },
    [postActivity]
  );

  const sendMessage = useCallback(
    text => {
      if (typeof text !== 'string') {
        warn(
          '❗ To comply with latest version of Direct Line schema, in future version, we may ignore sending non-text activity of type "message". Please use "messageBack" activity instead.'
        );
      }

      return postActivity({
        text,
        textFormat: 'plain',
        type: 'message'
      });
    },
    [postActivity]
  );

  const sendMessageBack = useCallback(
    (value, text, displayText) =>
      postActivity(
        updateMetadata(
          {
            text,
            type: 'message',
            value
          },
          {
            messageBackDisplayText: displayText,
            messageSubType: 'messageBack'
          }
        )
      ),
    [postActivity]
  );

  const sendPostBack = useCallback(
    value => {
      if (typeof value !== 'string') {
        warn(
          '❗ To comply with latest version of Direct Line schema, in future version, we may ignore sending non-text activity of type "message". Please use "messageBack" activity instead.'
        );
      }

      return postActivity(
        updateMetadata(
          {
            text: typeof value === 'string' ? value : undefined,
            type: 'message',
            value: typeof value !== 'string' ? value : undefined
          },
          {
            messageSubType: 'postBack'
          }
        )
      );
    },
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
    sendTimeout?: number;
    sendTimeoutForAttachments?: number;
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

  useMemo(() => dispatch(setSendTimeouts(styleOptions.sendTimeout, styleOptions.sendTimeoutForAttachments)), [
    dispatch,
    styleOptions.sendTimeout,
    styleOptions.sendTimeoutForAttachments
  ]);

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

  // TODO: Test if perf will improve if we shorten the children() as multiple useContext instead.
  //       As tested, the perf is faster than R13 by about 40%.
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
    sendTimeout: PropTypes.number,
    sendTimeoutForAttachments: PropTypes.number,
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
    sendTimeout?: number;
    sendTimeoutForAttachments?: number;
    typingAnimationDuration?: number;
    userAvatarImage?: string;
    userAvatarInitials?: string;
  };
  userId: string;
  username?: string;
}> = ({ children, directLine, store, styleOptions, userId, username }) => {
  debug || (debug = createDebug('<LegacyChatAdapterBridge>', { backgroundColor: 'yellow', color: 'black' }));

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
    sendTimeout: PropTypes.number,
    sendTimeoutForAttachments: PropTypes.number,
    typingAnimationDuration: PropTypes.number,
    userAvatarImage: PropTypes.string,
    userAvatarInitials: PropTypes.string
  }).isRequired,
  userId: PropTypes.string,
  username: PropTypes.string
};

export default LegacyChatAdapterBridge;