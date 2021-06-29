import {
  ActivityRequestError,
  ActivityResponse,
  AdaptiveApplet,
  AdaptiveCard,
  ChannelAdapter,
  ErrorResponse,
  GlobalSettings,
  HostConfig,
  SerializableObject,
  SerializationContext,
  SuccessResponse
} from 'adaptivecards';

import { Components, hooks } from 'botframework-webchat-component';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState, VFC } from 'react';

import addPersistentClassWithUndo from '../utils/dom/addPersistentClassWithUndo';
import disableInputElementsWithUndo from '../utils/dom/disableInputElementsWithUndo';
import isPlainObject from '../utils/isPlainObject';
import setAttributeWithUndo from '../utils/dom/setAttributeWithUndo';
import useAdaptiveCardsHostConfig from '../adaptiveCards/hooks/useAdaptiveCardsHostConfig';
import usePrevious from '../utils/hooks/usePrevious';
import useRefFrom from '../utils/hooks/useRefFrom';
import useStyleOptions from '../hooks/useStyleOptions';
import useAdaptiveCardsMaxVersion from '../adaptiveCards/hooks/internal/useAdaptiveCardsMaxVersion';

const {
  useDisabled,
  useLocalizer,
  usePerformCardAction,
  useRenderMarkdownAsHTML,
  useScrollToEnd,
  useSendInvoke,
  useStyleSet,
  useTrackTiming
} = hooks;

const { ErrorBox, TextContent } = Components;

type AdaptiveAppletFrameworkAttachmentProps = {
  attachment: {
    contentType: 'application/vnd.microsoft.card.adaptive';
    content: Omit<any, '$schema' | 'type' | 'version'> & {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json';
      type: 'AdaptiveCard';
      version: string;
    };
  };
  disabled?: boolean;
};

const AdaptiveAppletFrameworkAttachment: VFC<AdaptiveAppletFrameworkAttachmentProps> = ({
  attachment: { content },
  disabled: disabledFromProps = false
}) => {
  const [{ actionPerformedClassName, showErrors }] = useStyleOptions();
  const [
    {
      adaptiveAppletFrameworkAttachment: adaptiveAppletFrameworkAttachmentStyleSet,
      adaptiveCardRenderer: adaptiveCardRendererStyleSet
    }
  ] = useStyleSet();
  const [actionsPerformed, setActionsPerformed] = useState([]);
  const [adaptiveCardsHostConfig] = useAdaptiveCardsHostConfig();
  const [disabledFromComposer] = useDisabled();
  const [errors, setErrors] = useState<Error[]>([]);
  const [finalString, setFinalString] = useState<string>();
  const [lastCardChanged, setLastCardChanged] = useState<number>(Date.now());
  const [maxVersion] = useAdaptiveCardsMaxVersion();
  const hostElementRef = useRef<HTMLDivElement>();
  const localize = useLocalizer();
  const performCardAction = usePerformCardAction();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const scrollToEnd = useScrollToEnd();
  const sendInvoke = useSendInvoke();
  const trackTiming = useTrackTiming<AdaptiveApplet>();

  const adaptiveCardsHostConfigRef = useRefFrom(adaptiveCardsHostConfig);
  const disabled = disabledFromComposer || disabledFromProps;
  const performCardActionRef = useRefFrom(performCardAction);
  const prevAdaptiveCardsHostConfig = usePrevious(adaptiveCardsHostConfig, adaptiveCardsHostConfig);
  const prevMaxVersion = usePrevious(maxVersion, maxVersion);
  const prevRenderMarkdownAsHTML = usePrevious(renderMarkdownAsHTML, renderMarkdownAsHTML);
  const renderMarkdownAsHTMLRef = useRefFrom(renderMarkdownAsHTML);

  const disabledRef = useRefFrom(disabled);

  const channelAdapter = useMemo<ChannelAdapter>(
    () => ({
      async sendRequestAsync(request): Promise<ActivityResponse> {
        try {
          const result = await sendInvoke('adaptiveCard/action', request.action.toJSON());

          switch (result.type) {
            case 'application/vnd.microsoft.card.adaptive':
              return new SuccessResponse(request, JSON.stringify(result.value));

            case 'application/vnd.microsoft.activity.message':
              setFinalString(result.value);

              // TODO: [P2] #XXX AdaptiveCards.SuccessResponse requires only 1 argument but it will throw if only 1 is passed.
              return new SuccessResponse(request, '');

            default:
              // Received an unknown payload.
              return new ErrorResponse(request, new ActivityRequestError());
          }
        } catch (err) {
          return new ErrorResponse(request, new ActivityRequestError('', err.message));
        }
      }
    }),
    [setFinalString, sendInvoke]
  );

  const maxVersionRef = useRefFrom(maxVersion);

  const handleAppletAction = useCallback(
    (_, action) => {
      // AdaptiveApplet will not emit "action" event for "Action.ShowCard" and "Action.ToggleVisibility".
      if (disabledRef.current) {
        return;
      }

      const { current: performCardAction } = performCardActionRef;
      const { iconUrl: image, title, type } = action.toJSON();

      switch (type) {
        case 'Action.Execute':
          // Skipping "ExecuteAction" because it will be handled by ChannelAdapter.
          break;

        case 'Action.OpenUrl':
          performCardAction({
            image,
            title,
            type: 'openUrl',
            value: action.url
          });

          break;

        case 'Action.Submit':
          if (typeof action.data === 'string') {
            performCardAction({
              image,
              title,
              type: 'imBack',
              value: action.data
            });
          } else if (typeof action.data !== 'undefined') {
            performCardAction({
              image,
              title,
              type: 'postBack',
              value: action.data
            });
          }

          scrollToEnd();

          break;

        default:
          console.warn(`botframework-webchat: Received unknown action "${type}" from Adaptive Cards.`, { action });

          break;
      }

      setActionsPerformed(prevActionsPerformed => Array.from(new Set([...prevActionsPerformed, action])));
    },
    [disabledRef, performCardActionRef, scrollToEnd]
  );

  const handleProcessMarkdown = useCallback(
    (text: string, result: { outputHtml?: string; didProcess: boolean }) => {
      const { current: renderMarkdownAsHTML } = renderMarkdownAsHTMLRef;

      if (renderMarkdownAsHTML) {
        result.outputHtml = renderMarkdownAsHTML(text);
        result.didProcess = true;
      }
    },
    [renderMarkdownAsHTMLRef]
  );

  const handleCardChanging = useCallback(() => {
    // Host config and max version need to be applied before "onCardChanging".
    // Only render Markdown can be applied here.
    AdaptiveCard.onProcessMarkdown = handleProcessMarkdown;

    // For accessibility issue #1340, `tabindex="0"` must not be set for the root container if it is not interactive.
    // Only rich cards support tabbing at the root. Adaptive Cards do not support tabbing, so we can safely set this to false.
    GlobalSettings.setTabIndexAtCardRoot = false;

    return true;
  }, [handleProcessMarkdown]);

  const handleCardChanged = useCallback(
    (applet: AdaptiveApplet) => {
      const { validationEvents } = applet.card.validateProperties();

      setActionsPerformed([]);
      setErrors(validationEvents.map(({ message }) => new Error(message)));
      setLastCardChanged(Date.now());
    },
    [setActionsPerformed, setErrors, setLastCardChanged]
  );

  const handleCreateSerializationContext = useCallback(() => new SerializationContext(maxVersionRef.current), [
    maxVersionRef
  ]);

  const applet: AdaptiveApplet = useMemo(
    () =>
      trackTiming('AdaptiveApplet.create', () => {
        const { current: adaptiveCardsHostConfig } = adaptiveCardsHostConfigRef;

        const applet = new AdaptiveApplet();

        applet.channelAdapter = channelAdapter;
        applet.onAction = handleAppletAction;
        applet.onCreateSerializationContext = handleCreateSerializationContext;

        // Both "onCardChanged" and "onCardChanging" will be called on initial render.
        applet.onCardChanging = handleCardChanging;
        applet.onCardChanged = handleCardChanged;

        // Host config must be applied before setCard() and cannot be applied during card changing.
        applet.hostConfig = isPlainObject(adaptiveCardsHostConfig)
          ? new HostConfig(adaptiveCardsHostConfig)
          : adaptiveCardsHostConfig;

        if (maxVersionRef) {
          SerializableObject.defaultMaxVersion = maxVersionRef.current;
        }

        applet.setCard(content);

        // After return of this function, AdaptiveApplet will call "onCardChanged".
        // Card will be validated and error messages will be shown as needed.

        return applet;
      }),
    [
      adaptiveCardsHostConfigRef, // "hostConfig" change should not recreate applet, we will re-set the card below.
      channelAdapter,
      content,
      handleAppletAction,
      handleCardChanged,
      handleCardChanging,
      handleCreateSerializationContext,
      handleProcessMarkdown,
      maxVersionRef, // "maxVersion" change should not recreate applet, we will re-set the card below.
      setLastCardChanged
    ]
  );

  const prevApplet = usePrevious(applet, applet);

  useMemo(() => {
    // If applet changed, it will automatically applies the latest host config and "renderMarkdown".
    // Only applies if the applet has not changed.
    if (applet && applet === prevApplet) {
      const adaptiveCardsHostConfigChanged = adaptiveCardsHostConfig !== prevAdaptiveCardsHostConfig;
      const maxVersionChanged = maxVersion !== prevMaxVersion;

      // If either AC host config or renderMarkdownAsHTML changed, we should re-render the card.
      if (adaptiveCardsHostConfigChanged) {
        // Host config must be applied before setCard() and cannot be applied during card changing.
        applet.hostConfig = isPlainObject(adaptiveCardsHostConfig)
          ? new HostConfig(adaptiveCardsHostConfig)
          : adaptiveCardsHostConfig;
      }

      if (maxVersionChanged) {
        // We must change "SerializableObject.defaultMaxVersion" before "onCardChanging".
        SerializableObject.defaultMaxVersion = maxVersion;
      }

      if (adaptiveCardsHostConfigChanged || maxVersionChanged || renderMarkdownAsHTML !== prevRenderMarkdownAsHTML) {
        // "applet.refreshCard" is not meant for re-rendering the card. Instead, we need to re-set the card.
        applet.setCard(applet.card.toJSON());
      }
    }
  }, [
    adaptiveCardsHostConfig,
    applet,
    maxVersion,
    prevMaxVersion,
    prevAdaptiveCardsHostConfig,
    prevApplet,
    prevRenderMarkdownAsHTML,
    renderMarkdownAsHTML
  ]);

  // Mount applet to DOM if its "renderedElement" changed.
  useEffect(() => {
    const { current: hostElement } = hostElementRef;
    const { renderedElement } = applet;

    if (hostElement && renderedElement) {
      hostElement.appendChild(renderedElement);

      return () => hostElement.removeChild(renderedElement);
    }
  }, [applet.renderedElement]);

  // Applies DOM hacks that improves accessibility.
  useEffect(() => {
    const undoStack: (() => void)[] = [];

    // Add aria-pressed and role attribute to the AC action button selected by the user.
    actionsPerformed.forEach(({ renderedElement }) => {
      if (renderedElement && hostElementRef.current.contains(renderedElement)) {
        undoStack.push(
          setAttributeWithUndo(renderedElement, 'aria-pressed', 'true'),
          setAttributeWithUndo(renderedElement, 'role', 'button')
        );
      }
    });

    // Add developers to highlight actions when they have been clicked.
    actionPerformedClassName &&
      undoStack.push(
        ...actionsPerformed.map(
          ({ renderedElement }) =>
            renderedElement &&
            hostElementRef.current.contains(renderedElement) &&
            addPersistentClassWithUndo(renderedElement, actionPerformedClassName)
        )
      );

    return () => undoStack.forEach(undo => undo && undo());
  }, [actionsPerformed, actionPerformedClassName, applet, lastCardChanged]);

  // Applies DOM hacks for "disabled" props.
  useEffect(() => {
    // If the Adaptive Card get re-rendered, re-disable elements as needed.
    if (disabled) {
      return disableInputElementsWithUndo(hostElementRef.current);
    }
  }, [disabled, lastCardChanged]);

  return (
    <div
      className={classNames(
        'webchat__adaptive-applet-framework',
        'webchat__adaptive-card-renderer',
        adaptiveAppletFrameworkAttachmentStyleSet,
        adaptiveCardRendererStyleSet
      )}
    >
      {finalString ? (
        <TextContent text={finalString} />
      ) : errors.length ? (
        showErrors && <ErrorBox error={errors[0]} type={localize('ADAPTIVE_CARD_ERROR_BOX_TITLE_RENDER')} />
      ) : (
        <div ref={hostElementRef} />
      )}
    </div>
  );
};

AdaptiveAppletFrameworkAttachment.defaultProps = {
  disabled: undefined
};

AdaptiveAppletFrameworkAttachment.propTypes = {
  // PropTypes and TypeScript isn't exactly compatible with each other.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  attachment: PropTypes.shape({
    contentType: PropTypes.oneOf(['application/vnd.microsoft.card.adaptive']).isRequired,
    content: PropTypes.any.isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default AdaptiveAppletFrameworkAttachment;
