// TODO: Should we move this bridge to bf-wc-core?

import {
  connect as createConnectAction,
  createStore,
  disconnect as createDisconnectAction,
  emitTypingIndicator as createEmitTypingIndicatorAction,
  getMetadata,
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

function chainUpdateIn<T>(target: T, chain: [string[], (value: any) => any][]): T {
  return chain.reduce((target, [path, updater]) => updateIn(target, path, updater), target);
}

function useSelectMap<T, U, V>(array: T[], data: U, selector: (entry: T, data: U) => V, updater: (value: V) => V) {
  const entries = useMemoAll(selector, (select: (entry: T, data: U) => V) =>
    array.map(element => select(element, data))
  );

  return useMemoAll(updater, (update: (value: V) => V) => entries.map((entry: V) => update(entry)), [entries]);
}

function usePatchActivities(
  directLineActivities: any[],
  styleOptions: {
    botAvatarImage?: string;
    botAvatarInitials?: string;
    userAvatarImage?: string;
    userAvatarInitials?: string;
  }
) {
  // TODO: Patch the followings:
  //       - webchat:delivery-status
  //       - webchat:tracking-number
  return useSelectMap(
    directLineActivities,
    styleOptions,
    useCallback((directLineActivity, { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials }) => {
      const {
        channelData: { clientActivityID } = { clientActivityID: undefined },
        from: { id, name, role }
      } = directLineActivity;
      const { who } = getMetadata(directLineActivity);

      const senderName = role === 'bot' ? (id === name ? '__BOT__' : name) : name;
      const self = who === 'self';

      return [
        directLineActivity,
        self ? userAvatarImage : botAvatarImage,
        self ? userAvatarInitials : botAvatarInitials,
        clientActivityID || directLineActivity.id,
        senderName,
        who
      ];
    }, []),
    useCallback(
      ([directLineActivity, avatarImage, avatarInitials, key, senderName, who]) =>
        updateMetadata(directLineActivity, {
          avatarImage,
          avatarInitials,
          key,
          senderName,
          who
        }),
      []
    )
  );
}

const Activities: FC<{
  botAvatarImage?: string;
  botAvatarInitials?: string;
  children: ({ activities }) => any;
  userAvatarImage?: string;
  userAvatarInitials?: string;
}> = ({ botAvatarImage, botAvatarInitials, children, userAvatarImage, userAvatarInitials }) => {
  const activities = useSelector(({ activities }) => activities);
  const styleOptions = useMemo(
    () => ({
      botAvatarImage,
      botAvatarInitials,
      userAvatarImage,
      userAvatarInitials
    }),
    [botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials]
  );

  const patchedActivities = usePatchActivities(activities, styleOptions);

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

  const normalizedTyping = Object.fromEntries(
    Object.entries(typing).filter(([, { at, role }]) => Date.now() < at + typingAnimationDuration && role !== 'user')
  );

  const prevTyping = usePrevious(normalizedTyping);
  const typingUsersRef = useRef({});
  let { current: nextTypingUsers } = typingUsersRef;

  Object.entries(diffMap(prevTyping, normalizedTyping)).forEach(([userId, [, to]]) => {
    if (to) {
      nextTypingUsers = updateIn(nextTypingUsers, [userId, 'name'], () => to.name);
    } else {
      nextTypingUsers = updateIn(nextTypingUsers, [userId]);
    }
  });

  typingUsersRef.current = nextTypingUsers;

  const nextRefreshAt = Math.min(...Object.values(normalizedTyping).map(({ at }) => at)) + typingAnimationDuration;
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
  const dispatchRefForCallbacks = useRef<(action: any) => void>();
  const emitTypingIntervalRef = useRef<NodeJS.Timeout>();

  dispatchRefForCallbacks.current = dispatch;

  const pulseTyping = useCallback(() => {
    const { current: dispatch } = dispatchRefForCallbacks;

    dispatch && dispatch(createEmitTypingIndicatorAction());
  }, [dispatchRefForCallbacks]);

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

const Notifications: FC<{
  children: ({ notifications }: { notifications: any[] }) => any;
}> = ({ children }) => {
  const notifications = useSelector(({ notifications }) => notifications);

  return children({ notifications });
};

Notifications.propTypes = {
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
    sendFiles: (files: any[]) => string; // TODO: Change the type to Blob | File
    sendMessage: (text: string) => string;
    sendMessageBack: (value: any, text: string, displayText: string) => string;
    sendPostBack: (value: any) => string;
  }) => any;
}> = ({ activities, children }) => {
  const activitiesRefForCallback = useRef<any[]>();
  const dispatch = useDispatch();

  activitiesRefForCallback.current = activities;

  const postActivity = useCallback(
    (activity: any): string => {
      // Use the sendTimeout
      // const { sendTimeout } = styleOptions;

      // TODO: Convert to async function
      //       POST_ACTIVITY_REJECTED = reject
      //       POST_ACTIVITY_FULFILLED = resolve
      // TODO: We should be diligent on what channelData to send, should we strip out "webchat:*"?

      const trackingNumber = `t-${random().toString(36).substr(2, 10)}`;

      dispatch(createPostActivityAction(updateMetadata(activity, { trackingNumber })));

      return trackingNumber;
    },
    // [dispatch, styleOptions.sendTimeout]
    [dispatch]
  );

  const resend = useCallback(
    (trackingNumber: string) => {
      const activity = activitiesRefForCallback.current.find(
        activity => getMetadata(activity).trackingNumber === trackingNumber
      );

      if (!activity) {
        throw new Error(`Resend cannot find activity with tracking number "${trackingNumber}"`);
      }

      return postActivity(activity);
    },
    [activitiesRefForCallback, postActivity]
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
  userProfiles: {
    [userId: string]: {
      image?: string;
      initials?: string;
      name?: string;
    };
  };
}> = ({ children, directLine, styleOptions, userId: userIdFromProps, username: usernameFromProps, userProfiles }) => {
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
                    <Notifications>
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
                    </Notifications>
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
  userId: undefined
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
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  ).isRequired
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
  userProfiles?: {
    [userId: string]: {
      image?: string;
      initials?: string;
      name?: string;
    };
  };
}> = ({ children, directLine, store, styleOptions, userId, username, userProfiles }) => {
  const memoizedStore = useMemo(() => store || createStore(), [store]);

  const { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials } = styleOptions;

  const patchedUserProfiles = useMemo(
    () =>
      chainUpdateIn(userProfiles || {}, [
        [[userId, 'image'], () => userAvatarImage],
        [[userId, 'initials'], () => userAvatarInitials],
        [[userId, 'name'], () => username],
        [['__BOT__', 'image'], () => botAvatarImage],
        [['__BOT__', 'initials'], () => botAvatarInitials]
      ]),
    [botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials, username, userProfiles]
  );

  return (
    <Provider context={WebChatReduxContext} store={memoizedStore}>
      <ConnectedLegacyChatAdapterBridge
        directLine={directLine}
        styleOptions={styleOptions}
        userId={userId}
        username={username}
        userProfiles={patchedUserProfiles}
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
  username: undefined,
  userProfiles: {}
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
  username: PropTypes.string,
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  )
};

export default LegacyChatAdapterBridge;
