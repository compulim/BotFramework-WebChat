import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

import ActivitiesComposer from './internal/ActivitiesComposer';
import CardActionComposer from './internal/CardActionComposer';
import createCustomEvent from '../utils/createCustomEvent';
import createDebug from '../utils/debug';
import createDefaultGroupActivitiesMiddleware from './middleware/createDefaultGroupActivitiesMiddleware';
import defaultSelectVoice from './internal/defaultSelectVoice';
import ErrorBoundary from './utils/ErrorBoundary';
import getAllLocalizedStrings from '../localization/getAllLocalizedStrings';
import InputComposer from './internal/InputComposer';
import isObject from '../utils/isObject';
import LegacyChatAdapterBridge from './internal/LegacyChatAdapterBridge';
import normalizeLanguage from '../utils/normalizeLanguage';
import NotificationComposer from './internal/NotificationComposer';
import patchStyleOptions from '../patchStyleOptions';
import PrecompiledGlobalize from '../external/PrecompiledGlobalize';
import singleToArray from './utils/singleToArray';
import SpeechComposer from './internal/SpeechComposer';
import Tracker from './internal/Tracker';
import TypingComposer from './internal/TypingComposer';
import WebChatAPIContext from './internal/WebChatAPIContext';

import applyMiddleware, {
  forLegacyRenderer as applyMiddlewareForLegacyRenderer,
  forRenderer as applyMiddlewareForRenderer
} from './middleware/applyMiddleware';

let debug;

function createGroupActivitiesContext({ groupActivitiesMiddleware, groupTimestamp }) {
  const runMiddleware = applyMiddleware(
    'group activities',
    ...singleToArray(groupActivitiesMiddleware),
    createDefaultGroupActivitiesMiddleware({ groupTimestamp })
  );

  return {
    groupActivities: runMiddleware({})
  };
}

function mergeStringsOverrides(localizedStrings, language, overrideLocalizedStrings) {
  if (!overrideLocalizedStrings) {
    return localizedStrings;
  } else if (typeof overrideLocalizedStrings === 'function') {
    const merged = overrideLocalizedStrings(localizedStrings, language);

    if (!isObject(merged)) {
      throw new Error('botframework-webchat: overrideLocalizedStrings function must return an object.');
    }

    return merged;
  }

  if (!isObject(overrideLocalizedStrings)) {
    throw new Error('botframework-webchat: overrideLocalizedStrings must be either a function, an object, or falsy.');
  }

  return { ...localizedStrings, ...overrideLocalizedStrings };
}

const Composer = ({
  activities,
  activityMiddleware,
  activityRenderer,
  activityStatusMiddleware,
  activityStatusRenderer,
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  attachmentRenderer,
  avatarMiddleware,
  avatarRenderer,
  cardActionMiddleware,
  children,
  dir,
  directLineReferenceGrammarId,
  disabled,
  downscaleImageToDataURL,
  emitTypingIndicator,
  getDirectLineOAuthCodeChallenge,
  grammars,
  groupActivitiesMiddleware,
  groupTimestamp,
  internalErrorBoxClass,
  locale,
  notifications,
  onTelemetry,
  overrideLocalizedStrings,
  renderMarkdown,
  selectVoice,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  sendReadReceipt,
  sendTimeout,
  sendTypingIndicator,
  styleOptions,
  toastMiddleware,
  toastRenderer,
  typingIndicatorMiddleware,
  typingIndicatorRenderer,
  typingUsers,
  userId,
  username,
  webSpeechPonyfillFactory
}) => {
  debug || (debug = createDebug('<Composer>', { backgroundColor: 'red' }));

  useMemo(() => {
    const capabilities = [];

    capabilities.push(`${notifications ? '✔️' : '❌'} Notifications (includes connectivity status)`);
    capabilities.push(`${userId ? '✔️' : '❌'} Provide user ID`);
    capabilities.push(`${typeof username === 'string' ? '✔️' : '❌'} Provide username`);
    capabilities.push(`${sendReadReceipt ? '✔️' : '❌'} Return read receipts`);
    capabilities.push(`${sendEvent ? '✔️' : '❌'} Send event`);
    capabilities.push(`${sendFiles ? '✔️' : '❌'} Send file`);
    capabilities.push(`${sendMessage ? '✔️' : '❌'} Send text message`);
    capabilities.push(`${sendMessageBack ? '✔️' : '❌'} Send message back action`);
    capabilities.push(`${sendPostBack ? '✔️' : '❌'} Send post back action`);
    capabilities.push(`${activities ? '✔️' : '❌'} Transcript`);

    if (typingUsers) {
      capabilities.push('✔️ Typing indicator (receive)');
    }

    if (emitTypingIndicator) {
      capabilities.push('✔️ Typing indicator (send)');
    }

    if (!emitTypingIndicator && !typingUsers) {
      capabilities.push('❌ Typing indicator (send and receive)');
    }

    directLineReferenceGrammarId && capabilities.push('✔️ Direct Line: Reference grammar ID');
    getDirectLineOAuthCodeChallenge && capabilities.push('✔️ Direct Line: OAuth');

    debug(`Chat adapter capabilities:\n\n${capabilities.join('\n')}`);

    // Regardless if the chat adapter changed, we only publish the capability list once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const telemetryDimensionsRef = useRef({});

  const patchedDir = useMemo(() => (dir === 'ltr' || dir === 'rtl' ? dir : 'auto'), [dir]);
  const patchedGrammars = useMemo(() => grammars || [], [grammars]);
  const patchedStyleOptions = useMemo(() => patchStyleOptions(styleOptions, { groupTimestamp, sendTimeout }), [
    groupTimestamp,
    sendTimeout,
    styleOptions
  ]);

  const patchedSelectVoice = useMemo(() => selectVoice || defaultSelectVoice.bind(null, { language: locale }), [
    locale,
    selectVoice
  ]);

  const groupActivitiesContext = useMemo(
    () =>
      createGroupActivitiesContext({
        groupActivitiesMiddleware,
        groupTimestamp: patchedStyleOptions.groupTimestamp
      }),
    [groupActivitiesMiddleware, patchedStyleOptions.groupTimestamp]
  );

  const patchedLocalizedStrings = useMemo(
    () => mergeStringsOverrides(getAllLocalizedStrings()[normalizeLanguage(locale)], locale, overrideLocalizedStrings),
    [locale, overrideLocalizedStrings]
  );

  const localizedGlobalize = useMemo(() => {
    const { GLOBALIZE, GLOBALIZE_LANGUAGE } = patchedLocalizedStrings || {};

    return GLOBALIZE || (GLOBALIZE_LANGUAGE && PrecompiledGlobalize(GLOBALIZE_LANGUAGE)) || PrecompiledGlobalize('en');
  }, [patchedLocalizedStrings]);

  const trackDimension = useCallback(
    (name, data) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: Telemetry dimension name must be a string.');
      }

      const type = typeof data;

      if (type !== 'string' && type !== 'undefined') {
        return console.warn('botframework-webchat: Telemetry dimension data must be a string or undefined.');
      }

      telemetryDimensionsRef.current = updateIn(
        telemetryDimensionsRef.current,
        [name],
        type === 'undefined' ? data : () => data
      );
    },
    [telemetryDimensionsRef]
  );

  const patchedActivityRenderer = useMemo(() => {
    activityRenderer &&
      console.warn(
        'Web Chat: "activityRenderer" is deprecated and will be removed on 2022-06-15, please use "activityMiddleware" instead.'
      );

    return (
      activityRenderer ||
      applyMiddlewareForRenderer(
        'activity',
        { strict: false },
        ...singleToArray(activityMiddleware),
        () => () => ({ activity }) => {
          if (activity) {
            throw new Error(`No renderer for activity of type "${activity.type}"`);
          } else {
            throw new Error('No activity to render');
          }
        }
      )({})
    );
  }, [activityMiddleware, activityRenderer]);

  const patchedActivityStatusRenderer = useMemo(() => {
    activityStatusRenderer &&
      console.warn(
        'Web Chat: "activityStatusRenderer" is deprecated and will be removed on 2022-06-15, please use "activityStatusMiddleware" instead.'
      );

    return (
      activityStatusRenderer ||
      applyMiddlewareForRenderer(
        'activity status',
        { strict: false },
        ...singleToArray(activityStatusMiddleware),
        () => () => () => false
      )({})
    );
  }, [activityStatusMiddleware, activityStatusRenderer]);

  const patchedAttachmentForScreenReaderRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'attachment for screen reader',
        { strict: true },
        ...singleToArray(attachmentForScreenReaderMiddleware),
        () => () => ({ attachment }) => {
          if (attachment) {
            console.warn(`No renderer for attachment for screen reader of type "${attachment.contentType}"`);
            return false;
          }

          return () => {
            /**
             * @todo TODO: [P4] Might be able to throw without returning a function -- investigate and possibly fix
             */
            throw new Error('No attachment to render');
          };
        }
      )({}),
    [attachmentForScreenReaderMiddleware]
  );

  const patchedAttachmentRenderer = useMemo(() => {
    if (attachmentRenderer) {
      console.warn(
        'Web Chat: "attachmentRenderer" is deprecated and will be removed on 2022-06-15, please use "attachmentMiddleware" instead.'
      );

      return attachmentRenderer;
    }

    // Attachment renderer
    return applyMiddlewareForLegacyRenderer(
      'attachment',
      ...singleToArray(attachmentMiddleware),
      () => () => ({ attachment }) => {
        if (attachment) {
          throw new Error(`No renderer for attachment of type "${attachment.contentType}"`);
        } else {
          throw new Error('No attachment to render');
        }
      }
    )({});
  }, [attachmentMiddleware, attachmentRenderer]);

  const patchedAvatarRenderer = useMemo(() => {
    avatarRenderer &&
      console.warn(
        'Web Chat: "avatarRenderer" is deprecated and will be removed on 2022-06-15, please use "avatarMiddleware" instead.'
      );

    return (
      avatarRenderer ||
      applyMiddlewareForRenderer('avatar', { strict: false }, ...singleToArray(avatarMiddleware), () => () => () =>
        false
      )({})
    );
  }, [avatarMiddleware, avatarRenderer]);

  const patchedToastRenderer = useMemo(() => {
    toastRenderer &&
      console.warn(
        'Web Chat: "toastRenderer" is deprecated and will be removed on 2022-06-15, please use "toastMiddleware" instead.'
      );

    return (
      toastRenderer ||
      applyMiddlewareForRenderer(
        'toast',
        { strict: false },
        ...singleToArray(toastMiddleware),
        () => () => ({ notification }) => {
          if (notification) {
            throw new Error(`No renderer for notification of type "${notification.contentType}"`);
          } else {
            throw new Error('No notification to render');
          }
        }
      )({})
    );
  }, [toastMiddleware, toastRenderer]);

  const patchedTypingIndicatorRenderer = useMemo(() => {
    typingIndicatorRenderer &&
      console.warn(
        'Web Chat: "typingIndicatorRenderer" is deprecated and will be removed on 2022-06-15, please use "typingIndicatorMiddleware" instead.'
      );

    return (
      typingIndicatorRenderer ||
      applyMiddlewareForRenderer(
        'typing indicator',
        { strict: false },
        ...singleToArray(typingIndicatorMiddleware),
        () => () => () => false
      )({})
    );
  }, [typingIndicatorMiddleware, typingIndicatorRenderer]);

  const context = useMemo(
    () => ({
      ...groupActivitiesContext,
      activityRenderer: patchedActivityRenderer,
      activityStatusRenderer: patchedActivityStatusRenderer,
      attachmentForScreenReaderRenderer: patchedAttachmentForScreenReaderRenderer,
      attachmentRenderer: patchedAttachmentRenderer,
      avatarRenderer: patchedAvatarRenderer,
      dir: patchedDir,
      disabled,
      downscaleImageToDataURL,
      grammars: patchedGrammars,
      internalErrorBoxClass,
      language: locale,
      localizedGlobalizeState: [localizedGlobalize],
      localizedStrings: patchedLocalizedStrings,
      onTelemetry,
      renderMarkdown,
      selectVoice: patchedSelectVoice,
      sendTypingIndicator,
      styleOptions: patchedStyleOptions,
      telemetryDimensionsRef,
      toastRenderer: patchedToastRenderer,
      trackDimension,
      typingIndicatorRenderer: patchedTypingIndicatorRenderer,
      userId,
      username
    }),
    [
      disabled,
      downscaleImageToDataURL,
      groupActivitiesContext,
      internalErrorBoxClass,
      locale,
      localizedGlobalize,
      onTelemetry,
      patchedActivityRenderer,
      patchedActivityStatusRenderer,
      patchedAttachmentForScreenReaderRenderer,
      patchedAttachmentRenderer,
      patchedAvatarRenderer,
      patchedDir,
      patchedGrammars,
      patchedLocalizedStrings,
      patchedSelectVoice,
      patchedStyleOptions,
      patchedToastRenderer,
      patchedTypingIndicatorRenderer,
      renderMarkdown,
      sendTypingIndicator,
      telemetryDimensionsRef,
      trackDimension,
      userId,
      username
    ]
  );

  return (
    <WebChatAPIContext.Provider value={context}>
      <ActivitiesComposer activities={activities} sendReadReceipt={sendReadReceipt}>
        <NotificationComposer chatAdapterNotifications={notifications}>
          <TypingComposer
            emitTypingIndicator={emitTypingIndicator}
            sendTypingIndicator={sendTypingIndicator}
            typingUsers={typingUsers}
          >
            <InputComposer
              sendEvent={sendEvent}
              sendFiles={sendFiles}
              sendMessage={sendMessage}
              sendMessageBack={sendMessageBack}
              sendPostBack={sendPostBack}
            >
              <SpeechComposer
                directLineReferenceGrammarId={directLineReferenceGrammarId}
                webSpeechPonyfillFactory={webSpeechPonyfillFactory}
              >
                <CardActionComposer
                  cardActionMiddleware={cardActionMiddleware}
                  getDirectLineOAuthCodeChallenge={getDirectLineOAuthCodeChallenge}
                >
                  {typeof children === 'function' ? children(context) : children}
                  {onTelemetry && <Tracker />}
                </CardActionComposer>
              </SpeechComposer>
            </InputComposer>
          </TypingComposer>
        </NotificationComposer>
      </ActivitiesComposer>
    </WebChatAPIContext.Provider>
  );
};

// We will create a Redux store if it was not passed in
const ComposeWithStore = ({ store, userID, username, ...props }) => {
  // TODO: We should eventually not needing these props in Web Chat, but only in chat adapter.
  const { directLine, internalRenderErrorBox, onTelemetry } = props;

  const [error, setError] = useState();

  const handleError = useCallback(
    error => {
      console.error('botframework-webchat: Uncaught exception', { error });

      onTelemetry && onTelemetry(createCustomEvent('exception', { error, fatal: true }));
      setError(error);
    },
    [onTelemetry, setError]
  );

  return error ? (
    !!internalRenderErrorBox && internalRenderErrorBox({ error, type: 'uncaught exception' })
  ) : (
    <ErrorBoundary onError={handleError}>
      {directLine ? (
        <LegacyChatAdapterBridge directLine={directLine} store={store} userId={userID} username={username}>
          {chatAdapterProps => <Composer {...chatAdapterProps} {...props} />}
        </LegacyChatAdapterBridge>
      ) : (
        <Composer {...props} />
      )}
    </ErrorBoundary>
  );
};

ComposeWithStore.defaultProps = {
  directLine: undefined,
  internalRenderErrorBox: undefined,
  onTelemetry: undefined,
  store: undefined,
  userID: undefined,
  username: undefined
};

ComposeWithStore.propTypes = {
  directLine: PropTypes.shape({
    activity$: PropTypes.shape({
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    connectionStatus$: PropTypes.shape({
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    end: PropTypes.func,
    getSessionId: PropTypes.func,
    referenceGrammarID: PropTypes.string,
    token: PropTypes.string
  }),
  internalRenderErrorBox: PropTypes.any,
  onTelemetry: PropTypes.func,
  store: PropTypes.any,
  userID: PropTypes.string,
  username: PropTypes.string
};

export default ComposeWithStore;

Composer.defaultProps = {
  activityMiddleware: undefined,
  activityRenderer: undefined,
  activityStatusMiddleware: undefined,
  activityStatusRenderer: undefined,
  attachmentForScreenReaderMiddleware: undefined,
  attachmentMiddleware: undefined,
  attachmentRenderer: undefined,
  avatarMiddleware: undefined,
  avatarRenderer: undefined,
  cardActionMiddleware: undefined,
  children: undefined,
  dir: 'auto',
  directLineReferenceGrammarId: undefined,
  disabled: false,
  downscaleImageToDataURL: undefined,
  emitTypingIndicator: undefined,
  getDirectLineOAuthCodeChallenge: undefined,
  grammars: [],
  groupActivitiesMiddleware: undefined,
  groupTimestamp: undefined,
  internalErrorBoxClass: undefined,
  locale: window.navigator.language || 'en-US',
  notifications: undefined,
  onTelemetry: undefined,
  overrideLocalizedStrings: undefined,
  renderMarkdown: undefined,
  selectVoice: undefined,
  sendEvent: undefined,
  sendFiles: undefined,
  sendMessage: undefined,
  sendMessageBack: undefined,
  sendPostBack: undefined,
  sendReadReceipt: undefined,
  sendTimeout: undefined,
  sendTypingIndicator: true,
  styleOptions: {},
  toastMiddleware: undefined,
  toastRenderer: undefined,
  typingIndicatorMiddleware: undefined,
  typingIndicatorRenderer: undefined,
  typingUsers: undefined,
  userId: '', // This is correct case, from the new chat adapter (or <LegacyChatAdapterBridge>).
  username: '',
  webSpeechPonyfillFactory: undefined
};

Composer.propTypes = {
  // TODO: Type the activity
  activities: PropTypes.array.isRequired,
  activityMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityRenderer: PropTypes.func,
  activityStatusMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityStatusRenderer: PropTypes.func,
  attachmentForScreenReaderMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentRenderer: PropTypes.func,
  avatarMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  avatarRenderer: PropTypes.func,
  cardActionMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  children: PropTypes.any,
  dir: PropTypes.oneOf(['auto', 'ltr', 'rtl']),
  directLineReferenceGrammarId: PropTypes.string,
  disabled: PropTypes.bool,
  downscaleImageToDataURL: PropTypes.func,
  emitTypingIndicator: PropTypes.func,
  getDirectLineOAuthCodeChallenge: PropTypes.func,
  grammars: PropTypes.arrayOf(PropTypes.string),
  groupActivitiesMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  internalErrorBoxClass: PropTypes.func, // This is for internal use only. We don't allow customization of error box.
  locale: PropTypes.string,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      alt: PropTypes.string,
      data: PropTypes.any,
      id: PropTypes.string.isRequired,
      level: PropTypes.string,
      message: PropTypes.string
    })
  ),
  onTelemetry: PropTypes.func,
  overrideLocalizedStrings: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  renderMarkdown: PropTypes.func,
  selectVoice: PropTypes.func,
  sendEvent: PropTypes.func,
  sendFiles: PropTypes.func,
  sendMessage: PropTypes.func,
  sendMessageBack: PropTypes.func,
  sendPostBack: PropTypes.func,
  sendReadReceipt: PropTypes.func,
  sendTimeout: PropTypes.number,
  sendTypingIndicator: PropTypes.bool,
  styleOptions: PropTypes.any,
  toastMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  toastRenderer: PropTypes.func,
  typingIndicatorMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  typingIndicatorRenderer: PropTypes.func,
  typingUsers: PropTypes.any, // TODO: Check why objectOf is not working on empty object.
  // typingUsers: PropTypes.objectOf({
  //   at: PropTypes.number,
  //   name: PropTypes.string,
  //   role: PropTypes.string,
  //   who: PropTypes.string
  // }),
  userId: PropTypes.string,
  username: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};
