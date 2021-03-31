/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2, 5, 36] }] */

import {
  Composer as ReactScrollToBottomComposer,
  Panel as ReactScrollToBottomPanel,
  useAnimatingToEnd,
  useObserveScrollPosition,
  useScrollTo,
  useScrollToEnd,
  useSticky
} from 'react-scroll-to-bottom';
import { fromWho, getMetadata, hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { default as TranscriptContext } from './Transcript/TranscriptContext';
import BasicTypingIndicator from './BasicTypingIndicator';
import createDebug from './Utils/debug';
import Fade from './Utils/Fade';
import FocusRedirector from './Utils/FocusRedirector';
import getActivityKey from './Utils/getActivityKey';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';
import inputtableKey from './Utils/TypeFocusSink/inputtableKey';
import intersectionOf from './Utils/intersectionOf';
import isZeroOrPositive from './Utils/isZeroOrPositive';
import removeInline from './Utils/removeInline';
import ScreenReaderActivity from './ScreenReaderActivity';
import ScreenReaderText from './ScreenReaderText';
import ScrollToEndButton from './Activity/ScrollToEndButton';
import SpeakActivity from './Activity/Speak';
import styleConsole from './Utils/styleConsole';
import tabbableElements from './Utils/tabbableElements';
import useAcknowledgedActivity from './hooks/internal/useAcknowledgedActivity';
import useDispatchScrollPosition from './hooks/internal/useDispatchScrollPosition';
import useDispatchTranscriptFocus from './hooks/internal/useDispatchTranscriptFocus';
import useFocus from './hooks/useFocus';
import useRegisterFocusTranscript from './hooks/internal/useRegisterFocusTranscript';
import useRegisterScrollRelative from './hooks/internal/useRegisterScrollRelative';
import useRegisterScrollTo from './hooks/internal/useRegisterScrollTo';
import useRegisterScrollToEnd from './hooks/internal/useRegisterScrollToEnd';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useUniqueId from './hooks/internal/useUniqueId';

const {
  useActivities,
  useHonorReadReceipts,
  useCreateAvatarRenderer,
  useDirection,
  useGroupActivities,
  useLocalizer,
  useStyleOptions
} = hooks;

let debug;

const ROOT_STYLE = {
  '&.webchat__basic-transcript': {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // Make sure to set "position: relative" here to form another stacking context for the scroll-to-end button.
    // Stacking context help isolating elements that use "z-index" from global pollution.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
    position: 'relative',

    '& .webchat__basic-transcript__filler': {
      flex: 1
    },

    '& .webchat__basic-transcript__scrollable': {
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
    },

    '& .webchat__basic-transcript__transcript': {
      listStyleType: 'none'
    }
  }
};

function validateAllActivitiesTagged(activities, bins) {
  return activities.every(activity => bins.some(bin => bin.includes(activity)));
}

const InternalTranscript = ({ activityElementsRef, className }) => {
  const [{ basicTranscript: basicTranscriptStyleSet }] = useStyleSet();
  const [styleOptions] = useStyleOptions();
  const [activitiesWithRenderer] = useActivities('with renderer');
  const [direction] = useDirection();
  const [focusedActivityKey, setFocusedActivityKey] = useState();
  const [synthesizingActivities] = useActivities('speech synthesis');
  const createAvatarRenderer = useCreateAvatarRenderer();
  const focus = useFocus();
  const groupActivities = useGroupActivities();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const rootElementRef = useRef();
  const terminatorRef = useRef();

  const {
    bubbleFromUserNubOffset,
    bubbleNubOffset,
    groupTimestamp,
    internalLiveRegionFadeAfter,
    showAvatarInGroup,
    showAvatarForOthers,
    showAvatarForSelf
  } = styleOptions;
  const activityInteractiveAlt = localize('ACTIVITY_INTERACTIVE_LABEL_ALT');
  const hideAllTimestamps = groupTimestamp === false;
  const terminatorText = localize('TRANSCRIPT_TERMINATOR_TEXT');
  const transcriptAriaLabel = localize('TRANSCRIPT_ARIA_LABEL_ALT');
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');
  const visibleActivities = useMemo(() => activitiesWithRenderer.map(({ activity }) => activity), [
    activitiesWithRenderer
  ]);

  const hasOthersAvatar = useMemo(
    () =>
      !!showAvatarForOthers &&
      activitiesWithRenderer.some(
        ({ activity }) => fromWho(activity) === 'others' && getMetadata(activity).avatarInitials
      ),
    [activitiesWithRenderer, showAvatarForOthers]
  );

  const hasSelfAvatar = useMemo(
    () =>
      !!showAvatarForSelf &&
      activitiesWithRenderer.some(
        ({ activity }) => fromWho(activity) === 'self' && getMetadata(activity).avatarInitials
      ),
    [activitiesWithRenderer, showAvatarForSelf]
  );

  const context = useMemo(() => ({ hasOthersAvatar, hasSelfAvatar }), [hasOthersAvatar, hasSelfAvatar]);

  // Tag activities based on types.
  // The default implementation tag into 2 types: sender and status.

  const { activitiesGroupBySender, activitiesGroupByStatus } = useMemo(() => {
    const { sender: activitiesGroupBySender, status: activitiesGroupByStatus } = groupActivities({
      activities: visibleActivities
    });

    if (!validateAllActivitiesTagged(visibleActivities, activitiesGroupBySender)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "sender" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    if (!validateAllActivitiesTagged(visibleActivities, activitiesGroupByStatus)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "status" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    return {
      activitiesGroupBySender,
      activitiesGroupByStatus
    };
  }, [groupActivities, visibleActivities]);

  // Create a tree of activities with 2 dimensions: sender, followed by status.

  const activityTree = useMemo(() => {
    const visibleActivitiesPendingGrouping = [...visibleActivities];
    const activityTree = [];

    while (visibleActivitiesPendingGrouping.length) {
      const [activity] = visibleActivitiesPendingGrouping;
      const senderTree = [];
      const activitiesWithSameSender = activitiesGroupBySender.find(activities => activities.includes(activity));

      activityTree.push(senderTree);

      activitiesWithSameSender.forEach(activity => {
        const activitiesWithSameStatus = activitiesGroupByStatus.find(activities => activities.includes(activity));

        const activitiesWithSameSenderAndStatus = intersectionOf(
          visibleActivitiesPendingGrouping,
          activitiesWithSameSender,
          activitiesWithSameStatus
        );

        if (activitiesWithSameSenderAndStatus.length) {
          senderTree.push(activitiesWithSameSenderAndStatus);
          removeInline(visibleActivitiesPendingGrouping, ...activitiesWithSameSenderAndStatus);
        }
      });
    }

    // Assertion: All activities in visibleActivities, must be assigned to the activityTree
    if (
      !visibleActivities.every(activity =>
        activityTree.some(activitiesWithSameSender =>
          activitiesWithSameSender.some(activitiesWithSameSenderAndStatus =>
            activitiesWithSameSenderAndStatus.includes(activity)
          )
        )
      )
    ) {
      console.warn('botframework-webchat internal: Not all visible activities are grouped in the activityTree.', {
        visibleActivities,
        activityTree
      });
    }

    return activityTree;
  }, [activitiesGroupBySender, activitiesGroupByStatus, visibleActivities]);

  // Flatten the tree back into an array with information related to rendering.

  const renderingElements = useMemo(() => {
    const renderingElements = [];
    const topSideBotNub = isZeroOrPositive(bubbleNubOffset);
    const topSideUserNub = isZeroOrPositive(bubbleFromUserNubOffset);

    activityTree.forEach(activitiesWithSameSender => {
      const [[firstActivity]] = activitiesWithSameSender;
      const renderAvatar = createAvatarRenderer({ activity: firstActivity, styleOptions });

      activitiesWithSameSender.forEach((activitiesWithSameSenderAndStatus, indexWithinSenderGroup) => {
        const firstInSenderGroup = !indexWithinSenderGroup;
        const lastInSenderGroup = indexWithinSenderGroup === activitiesWithSameSender.length - 1;

        activitiesWithSameSenderAndStatus.forEach((activity, indexWithinSenderAndStatusGroup) => {
          // We only show the timestamp at the end of the sender group. But we always show the "Send failed, retry" prompt.
          const firstInSenderAndStatusGroup = !indexWithinSenderAndStatusGroup;
          const lastInSenderAndStatusGroup =
            indexWithinSenderAndStatusGroup === activitiesWithSameSenderAndStatus.length - 1;

          const { renderActivity, renderActivityStatus } = activitiesWithRenderer.find(
            entry => entry.activity === activity
          );

          const key = getActivityKey(activity);
          const who = fromWho(activity);
          const { channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {}, text } = activity;

          const topSideNub = who === 'self' ? topSideUserNub : topSideBotNub;

          let showCallout;

          // Depends on different "showAvatarInGroup" setting, we will show the avatar in different positions.
          if (showAvatarInGroup === 'sender') {
            if (topSideNub) {
              showCallout = firstInSenderGroup && firstInSenderAndStatusGroup;
            } else {
              showCallout = lastInSenderGroup && lastInSenderAndStatusGroup;
            }
          } else if (showAvatarInGroup === 'status') {
            if (topSideNub) {
              showCallout = firstInSenderAndStatusGroup;
            } else {
              showCallout = lastInSenderAndStatusGroup;
            }
          } else {
            showCallout = true;
          }

          const focusActivity = () => {
            setFocusedActivityKey(key);

            // IE11 need to manually focus on the transcript.
            const { current: rootElement } = rootElementRef;

            rootElement && rootElement.focus();
          };

          renderingElements.push({
            activity,

            // After the element is mounted, set it to activityElementsRef.
            callbackRef: activityElement => {
              const entry = activityElementsRef.current.find(entry => entry.activityKey === key);

              if (entry) {
                entry.element = activityElement;
              }
            },

            // Calling this function will put the focus on the transcript and the activity.
            focusActivity,

            // When a child of the activity receives focus, notify the transcript to set the aria-activedescendant to this activity.
            handleFocus: () => {
              setFocusedActivityKey(getActivityKey(activity));
            },

            handleKeyDown: event => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();

                setFocusedActivityKey(getActivityKey(activity));

                const { current } = rootElementRef;

                current && current.focus();
              }
            },

            // For accessibility: when the user press up/down arrow keys, we put a visual focus indicator around the focused activity.
            // We should do the same for mouse, that is why we have the click handler here.
            // We are doing it in event capture phase to prevent other components from stopping event propagation to us.
            handleMouseDownCapture: ({ target }) => {
              const tabIndex = getTabIndex(target);

              if (typeof tabIndex !== 'number' || tabIndex < 0 || target.getAttribute('aria-disabled') === 'true') {
                focusActivity();
              }
            },

            // "hideTimestamp" is a render-time parameter for renderActivityStatus().
            // If true, it will hide the timestamp, but it will continue to show the
            // retry prompt. And show the screen reader version of the timestamp.
            hideTimestamp:
              hideAllTimestamps || indexWithinSenderAndStatusGroup !== activitiesWithSameSenderAndStatus.length - 1,
            key,

            // When "liveRegionKey" changes, it will show up in the live region momentarily.
            liveRegionKey: key + '|' + (messageBackDisplayText || text),
            renderActivity,
            renderActivityStatus,
            renderAvatar,
            showCallout,
            who
          });
        });
      });
    });

    const { current: activityElements } = activityElementsRef;

    // Update activityElementRef with new sets of activity, while retaining the existing referencing element if exists.
    activityElementsRef.current = renderingElements.map(({ activity, elementId, key }) => {
      const existingEntry = activityElements.find(entry => entry.key === key);

      return {
        activity,
        activityKey: getActivityKey(activity),
        ariaLabelId: existingEntry
          ? existingEntry.ariaLabelId
          : `webchat__basic-transcript__activity-label-${random().toString(36).substr(2, 5)}`,
        element: existingEntry && existingEntry.element,
        elementId,
        key
      };
    });

    // There must be one focused (a.k.a. aria-activedescendant) designated. We default it to the last one.
    if (!renderingElements.find(({ focused }) => focused)) {
      const lastElement = renderingElements[renderingElements.length - 1];

      if (lastElement) {
        lastElement.focused = true;
      }
    }

    return renderingElements;
  }, [
    activitiesWithRenderer,
    activityElementsRef,
    activityTree,
    bubbleFromUserNubOffset,
    bubbleNubOffset,
    createAvatarRenderer,
    hideAllTimestamps,
    rootElementRef,
    showAvatarInGroup,
    styleOptions
  ]);

  const scrollToBottomScrollTo = useScrollTo();
  const scrollToBottomScrollToEnd = useScrollToEnd();

  const scrollTo = useCallback(
    (position, { behavior = 'auto' } = {}) => {
      if (!position) {
        throw new Error(
          'botframework-webchat: First argument passed to "useScrollTo" must be a ScrollPosition object.'
        );
      }

      const { activityID, activityKey, scrollTop } = position;

      if (typeof scrollTop !== 'undefined') {
        scrollToBottomScrollTo(scrollTop, { behavior });
      } else if (typeof activityID !== 'undefined' || typeof activityKey !== 'undefined') {
        if (typeof activityID !== 'undefined') {
          console.warn(
            'botframework-webchat: passing "activityID" to scrollTo() has been deprecated, please use "activityKey" instead. This function will be deprecated by 2023-03-17.'
          );
        }

        const { current: rootElement } = rootElementRef;
        const { element: activityElement } =
          typeof activityKey !== 'undefined'
            ? activityElementsRef.current.find(entry => entry.activityKey === activityKey) || {}
            : activityElementsRef.current.find(entry => entry.activity.id === activityID) || {};

        const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

        if (scrollableElement && activityElement) {
          const [{ height: activityElementHeight, y: activityElementY }] = activityElement.getClientRects();
          const [{ height: scrollableHeight }] = scrollableElement.getClientRects();

          const activityElementOffsetTop = activityElementY + scrollableElement.scrollTop;

          const scrollTop = Math.min(
            activityElementOffsetTop,
            activityElementOffsetTop - scrollableHeight + activityElementHeight
          );

          scrollToBottomScrollTo(scrollTop, { behavior });
        }
      }
    },
    [activityElementsRef, rootElementRef, scrollToBottomScrollTo]
  );

  const scrollRelative = useCallback(
    (direction, { displacement } = {}) => {
      const { current: rootElement } = rootElementRef;

      if (!rootElement) {
        return;
      }

      const scrollable = rootElement.querySelector('.webchat__basic-transcript__scrollable');
      let nextScrollTop;

      if (typeof displacement === 'number') {
        nextScrollTop = scrollable.scrollTop + (direction === 'down' ? 1 : -1) * displacement;
      } else {
        nextScrollTop = scrollable.scrollTop + (direction === 'down' ? 1 : -1) * scrollable.offsetHeight;
      }

      scrollTo(
        {
          scrollTop: Math.max(0, Math.min(scrollable.scrollHeight - scrollable.offsetHeight, nextScrollTop))
        },
        { behavior: 'smooth' }
      );
    },
    [rootElementRef, scrollTo]
  );

  // Since there could be multiple instances of <BasicTranscript> inside the <Composer>, when the developer calls `scrollXXX`, we need to call it on all instances.
  // We call `useRegisterScrollXXX` to register a callback function, the `useScrollXXX` will multiplex the call into each instance of <BasicTranscript>.
  useRegisterScrollTo(scrollTo);
  useRegisterScrollToEnd(scrollToBottomScrollToEnd);
  useRegisterScrollRelative(scrollRelative);

  const dispatchScrollPosition = useDispatchScrollPosition();
  const patchedDispatchScrollPosition = useMemo(() => {
    if (!dispatchScrollPosition) {
      return;
    }

    return ({ scrollTop }) => {
      const { current: rootElement } = rootElementRef;

      if (!rootElement) {
        return;
      }

      const scrollableElement = rootElement.querySelector('.webchat__basic-transcript__scrollable');

      const [{ height: offsetHeight } = {}] = scrollableElement.getClientRects();

      // Find the activity just above scroll view bottom.
      // If the scroll view is already on top, get the first activity.
      const entry = scrollableElement.scrollTop
        ? [...activityElementsRef.current].reverse().find(({ element }) => {
            if (!element) {
              return false;
            }

            const [{ y } = {}] = element.getClientRects();

            return y < offsetHeight;
          })
        : activityElementsRef.current[0];

      const { activityKey } = entry || {};

      dispatchScrollPosition({ ...(activityKey ? { activityKey } : {}), scrollTop });
    };
  }, [activityElementsRef, dispatchScrollPosition, rootElementRef]);

  useObserveScrollPosition(patchedDispatchScrollPosition);

  // TOOD: This is a heavy hook because it call useSticky. Optimize the position for this hook.
  const [lastInteractedActivity] = useAcknowledgedActivity();

  const indexOfLastInteractedActivity = visibleActivities.indexOf(lastInteractedActivity);

  // Create a new ID for aria-activedescendant every time the active descendant change.
  // In our design, the transcript will only have 1 focused activity and it has an ID. Other blurred activities will not have ID assigned.
  // This help with performance.
  // But browser usually do noop if the value of aria-activedescendant doesn't change.
  // That means, if we assign the same ID to another element, browser will do noop.
  // We need to generate a new ID so the browser see there is a change in aria-activedescendant value and perform accordingly.
  const activeDescendantElementId = useMemo(
    () => focusedActivityKey && `webchat__basic-transcript__active-descendant-${random().toString(36).substr(2, 5)}`,
    [focusedActivityKey]
  );

  // Perf: decouple from callbacks
  const activeDescendantElementIdForCallbacksRef = useRef();

  activeDescendantElementIdForCallbacksRef.current = activeDescendantElementId;

  const scrollActiveDescendantIntoView = useCallback(() => {
    const { current: activeDescendantElementId } = activeDescendantElementIdForCallbacksRef;

    const activeDescendant = activeDescendantElementId && document.getElementById(activeDescendantElementId);

    // Don't scroll active descendant into view if the focus is already inside it.
    // Otherwise, given the focus is on the send box, clicking on any <input> inside the Adaptive Cards may cause the view to move.
    // This UX is not desirable because click should not cause scroll.
    if (activeDescendant && !activeDescendant.contains(document.activeElement)) {
      // Checks if scrollIntoView support options or not.
      // - https://github.com/Modernizr/Modernizr/issues/1568#issuecomment-419457972
      // - https://stackoverflow.com/questions/46919627/is-it-possible-to-test-for-scrollintoview-browser-compatibility
      if ('scrollBehavior' in document.documentElement.style) {
        activeDescendant.scrollIntoView({ block: 'nearest' });
      } else {
        // This is for browser that does not support options passed to scrollIntoView(), possibly IE11.
        const scrollableElement = rootElementRef.current.querySelector('.webchat__basic-transcript__scrollable');
        const scrollTopAtTopSide = activeDescendant.offsetTop;
        const scrollTopAtBottomSide = activeDescendant.offsetTop + activeDescendant.offsetHeight;

        if (scrollTopAtTopSide < scrollableElement.scrollTop) {
          scrollableElement.scrollTop = scrollTopAtTopSide;
        } else if (scrollTopAtBottomSide > scrollableElement.scrollTop + scrollableElement.offsetHeight) {
          scrollableElement.scrollTop = scrollTopAtBottomSide - scrollableElement.offsetHeight;
        }
      }
    }
  }, [activeDescendantElementIdForCallbacksRef, rootElementRef]);

  const handleTranscriptFocus = useCallback(
    event => {
      const { currentTarget, target } = event;

      // When focus is placed on the transcript, scroll active descendant into the view.
      currentTarget === target && scrollActiveDescendantIntoView();
    },
    [scrollActiveDescendantIntoView]
  );

  // After new aria-activedescendant is assigned, we will need to scroll it into view.
  // User agent will scroll automatically for focusing element, but not for aria-activedescendant.
  // We need to do the scrolling manually.
  useEffect(() => scrollActiveDescendantIntoView(), [scrollActiveDescendantIntoView]);

  // If any activities has changed, reset the active descendant.
  useEffect(() => setFocusedActivityKey(undefined), [setFocusedActivityKey, visibleActivities]);

  // Perf: decouple from callbacks

  const renderingElementsForCallbacksRef = useRef();

  renderingElementsForCallbacksRef.current = renderingElements;

  const focusRelativeActivity = useCallback(
    delta => {
      if (isNaN(delta) || !renderingElementsForCallbacksRef.current.length) {
        return setFocusedActivityKey(undefined);
      }

      rootElementRef.current && rootElementRef.current.focus();

      setFocusedActivityKey(focusedActivityKey => {
        const { current: renderingElements } = renderingElementsForCallbacksRef;

        const index = renderingElements.findIndex(({ key }) => key === focusedActivityKey);

        const nextIndex = ~index
          ? Math.max(0, Math.min(renderingElements.length - 1, index + delta))
          : renderingElements.length - 1;

        return (renderingElements[nextIndex] || {}).key;
      });
    },
    [renderingElementsForCallbacksRef, rootElementRef, setFocusedActivityKey]
  );

  const handleTranscriptKeyDown = useCallback(
    event => {
      const { current: renderingElements } = renderingElementsForCallbacksRef;
      const { target } = event;

      const fromEndOfTranscriptIndicator = target === terminatorRef.current;
      const fromTranscript = target === event.currentTarget;

      if (!fromEndOfTranscriptIndicator && !fromTranscript) {
        return;
      }

      let handled = true;

      switch (event.key) {
        case 'ArrowDown':
          focusRelativeActivity(fromEndOfTranscriptIndicator ? 0 : 1);
          break;

        case 'ArrowUp':
          focusRelativeActivity(fromEndOfTranscriptIndicator ? 0 : -1);
          break;

        case 'End':
          focusRelativeActivity(Infinity);
          break;

        case 'Enter':
          if (!fromEndOfTranscriptIndicator) {
            const focusedActivityEntry = renderingElements.find(({ key }) => key === focusedActivityKey);

            if (focusedActivityEntry) {
              const { element: focusedActivityElement } =
                activityElementsRef.current.find(({ activity }) => activity === focusedActivityEntry.activity) || {};

              if (focusedActivityElement) {
                const [firstTabbableElement] = tabbableElements(focusedActivityElement).filter(
                  ({ className }) => className !== 'webchat__basic-transcript__activity-sentinel'
                );

                firstTabbableElement && firstTabbableElement.focus();
              }
            }
          }

          break;

        case 'Escape':
          focus('sendBoxWithoutKeyboard');
          break;

        case 'Home':
          focusRelativeActivity(-Infinity);
          break;

        default:
          handled = false;
          break;
      }

      if (handled) {
        event.preventDefault();

        // If a custom HTML control wants to handle up/down arrow, we will prevent them from listening to this event to prevent bugs due to handling arrow keys twice.
        event.stopPropagation();
      }
    },
    [
      activityElementsRef,
      focus,
      focusedActivityKey,
      focusRelativeActivity,
      renderingElementsForCallbacksRef,
      terminatorRef
    ]
  );

  const labelId = useUniqueId('webchat__basic-transcript__label');

  // If SHIFT-TAB from "End of transcript" indicator, if focusedActivityKey is not set (or no longer exists), set it the the bottommost activity.
  const setBottommostFocusedActivityKeyIfNeeded = useCallback(() => {
    setFocusedActivityKey(focusedActivityKey => {
      const { current: renderingElements } = renderingElementsForCallbacksRef;

      if (!~renderingElements.findIndex(({ key }) => key === focusedActivityKey)) {
        return (renderingElements[renderingElements.length - 1] || {}).key;
      }

      return focusedActivityKey;
    });
  }, [renderingElementsForCallbacksRef, setFocusedActivityKey]);

  const handleTranscriptKeyDownCapture = useCallback(
    event => {
      const { altKey, ctrlKey, key, metaKey, target } = event;

      if (altKey || (ctrlKey && key !== 'v') || metaKey || (!inputtableKey(key) && key !== 'Backspace')) {
        // Ignore if one of the utility key (except SHIFT) is pressed
        // E.g. CTRL-C on a link in one of the message should not jump to chat box
        // E.g. "A" or "Backspace" should jump to chat box
        return;
      }

      // Send keystrokes to send box if we are focusing on the transcript or terminator.
      if (target === event.currentTarget || target === terminatorRef.current) {
        event.stopPropagation();

        focus('sendBox');
      }
    },
    [focus]
  );

  const focusTranscriptCallback = useCallback(() => rootElementRef.current && rootElementRef.current.focus(), [
    rootElementRef
  ]);

  useRegisterFocusTranscript(focusTranscriptCallback);

  const handleFocusActivity = useCallback(
    key => {
      setFocusedActivityKey(key);
      rootElementRef.current && rootElementRef.current.focus();
    },
    [setFocusedActivityKey]
  );

  // When the focusing activity has changed, dispatch an event to observers of "useObserveTranscriptFocus".
  const dispatchTranscriptFocus = useDispatchTranscriptFocus();
  const focusedActivity = useMemo(() => {
    const { activity } = renderingElementsForCallbacksRef.current.find(({ key }) => key === focusedActivityKey) || {};

    return activity;
  }, [focusedActivityKey, renderingElementsForCallbacksRef]);

  useMemo(() => dispatchTranscriptFocus && dispatchTranscriptFocus({ activity: focusedActivity }), [
    dispatchTranscriptFocus,
    focusedActivity
  ]);

  // This is required by IE11.
  // When the user clicks on and empty space (a.k.a. filler) in an empty transcript, IE11 says the focus is on the <div className="filler">,
  // despite the fact there are no "tabIndex" attributes set on the filler.
  // We need to artificially send the focus back to the transcript.
  const handleFocusFiller = useCallback(() => {
    const { current } = rootElementRef;

    current && current.focus();
  }, [rootElementRef]);

  return (
    <TranscriptContext.Provider value={context}>
      <div
        aria-activedescendant={focusedActivityKey ? activeDescendantElementId : undefined}
        aria-labelledby={labelId}
        className={classNames(
          'webchat__basic-transcript',
          basicTranscriptStyleSet + '',
          rootClassName,
          (className || '') + ''
        )}
        dir={direction}
        onFocus={handleTranscriptFocus}
        onKeyDown={handleTranscriptKeyDown}
        onKeyDownCapture={handleTranscriptKeyDownCapture}
        ref={rootElementRef}
        // "aria-activedescendant" will only works with a number of roles and it must be explicitly set.
        // https://www.w3.org/TR/wai-aria/#aria-activedescendant
        role="group"
        // For up/down arrow key navigation across activities, this component must be included in the tab sequence.
        // Otherwise, "aria-activedescendant" will not be narrated when the user press up/down arrow keys.
        // https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant
        tabIndex={0}
      >
        <ScreenReaderText id={labelId} text={transcriptAriaLabel} />
        {/* This <section> is for live region only. Content is made invisible through CSS. */}
        <section
          aria-atomic={false}
          aria-live="polite"
          aria-relevant="additions"
          aria-roledescription={transcriptRoleDescription}
          role="log"
        >
          {renderingElements.map(({ activity, liveRegionKey }) => (
            <Fade fadeAfter={internalLiveRegionFadeAfter} key={liveRegionKey}>
              {() => <ScreenReaderActivity activity={activity} />}
            </Fade>
          ))}
        </section>
        <InternalTranscriptScrollable
          onFocusActivity={handleFocusActivity}
          onFocusFiller={handleFocusFiller}
          terminatorRef={terminatorRef}
          visibleActivities={visibleActivities}
        >
          {renderingElements.map(
            (
              {
                activity,
                callbackRef,
                focusActivity,
                handleFocus,
                handleKeyDown,
                handleMouseDownCapture,
                hideTimestamp,
                key,
                renderActivity,
                renderActivityStatus,
                renderAvatar,
                showCallout,
                who
              },
              index
            ) => {
              const { ariaLabelId, element } =
                activityElementsRef.current.find(entry => entry.activity === activity) || {};
              const activeDescendant = focusedActivityKey === key;
              const isContentInteractive = !!(element
                ? tabbableElements(element.querySelector('.webchat__basic-transcript__activity-box')).length
                : 0);
              const shouldSpeak = synthesizingActivities.includes(activity);

              return (
                <li
                  aria-labelledby={ariaLabelId}
                  className={classNames('webchat__basic-transcript__activity', {
                    'webchat__basic-transcript__activity--acknowledged': index <= indexOfLastInteractedActivity,
                    'webchat__basic-transcript__activity--from-bot': who !== 'self',
                    'webchat__basic-transcript__activity--from-user': who === 'self'
                  })}
                  // Set "id" for valid for accessibility.
                  /* eslint-disable-next-line react/forbid-dom-props */
                  id={activeDescendant ? activeDescendantElementId : undefined}
                  key={key}
                  onFocus={handleFocus}
                  onKeyDown={handleKeyDown}
                  onMouseDownCapture={handleMouseDownCapture}
                  ref={callbackRef}
                >
                  <ScreenReaderActivity activity={activity} id={ariaLabelId} renderAttachments={false}>
                    {!!isContentInteractive && <p>{activityInteractiveAlt}</p>}
                  </ScreenReaderActivity>
                  <FocusRedirector
                    className="webchat__basic-transcript__activity-sentinel"
                    onFocus={focusActivity}
                    redirectRef={rootElementRef}
                  />
                  <div className="webchat__basic-transcript__activity-box">
                    {renderActivity({
                      hideTimestamp,
                      renderActivityStatus,
                      renderAvatar,
                      showCallout
                    })}
                  </div>
                  {shouldSpeak && <SpeakActivity activity={activity} />}
                  <FocusRedirector
                    className="webchat__basic-transcript__activity-sentinel"
                    onFocus={focusActivity}
                    redirectRef={rootElementRef}
                  />
                  <div
                    className={classNames('webchat__basic-transcript__activity-indicator', {
                      'webchat__basic-transcript__activity-indicator--first': !index,
                      'webchat__basic-transcript__activity-indicator--focus': activeDescendant
                    })}
                  />
                </li>
              );
            }
          )}
        </InternalTranscriptScrollable>
        {!!renderingElements.length && (
          <React.Fragment>
            <FocusRedirector
              className="webchat__basic-transcript__sentinel"
              onFocus={setBottommostFocusedActivityKeyIfNeeded}
              redirectRef={rootElementRef}
            />
            <div className="webchat__basic-transcript__terminator" ref={terminatorRef} tabIndex={0}>
              <div className="webchat__basic-transcript__terminator-body">
                <div className="webchat__basic-transcript__terminator-text">{terminatorText}</div>
              </div>
            </div>
          </React.Fragment>
        )}
        <div className="webchat__basic-transcript__focus-indicator" />
      </div>
    </TranscriptContext.Provider>
  );
};

InternalTranscript.defaultProps = {
  className: ''
};

InternalTranscript.propTypes = {
  activityElementsRef: PropTypes.shape({
    current: PropTypes.array.isRequired
  }).isRequired,
  className: PropTypes.string
};

const InternalScreenReaderTranscript = ({ renderingElements }) => {
  const localize = useLocalizer();
  const [internalLiveRegionFadeAfter] = useStyleOptions();

  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  return (
    <section
      aria-atomic={false}
      aria-live="polite"
      aria-relevant="additions"
      aria-roledescription={transcriptRoleDescription}
      role="log"
    >
      {renderingElements.map(({ activity, liveRegionKey }) => (
        <Fade fadeAfter={internalLiveRegionFadeAfter} key={liveRegionKey}>
          {() => <ScreenReaderActivity activity={activity} />}
        </Fade>
      ))}
    </section>
  );
};

InternalScreenReaderTranscript.propTypes = {
  renderingElements: PropTypes.arrayOf(
    PropTypes.shape({
      activity: PropTypes.any,
      liveRegionKey: PropTypes.string
    })
  ).isRequired
};

// Separating high-frequency hooks to improve performance.
const InternalTranscriptScrollable = ({
  children,
  onFocusActivity,
  onFocusFiller,
  terminatorRef,
  visibleActivities
}) => {
  const [{ activities: activitiesStyleSet }] = useStyleSet();
  const [{ hideScrollToEndButton }] = useStyleOptions();
  const [animatingToEnd] = useAnimatingToEnd();
  const [sticky] = useSticky();
  const lastVisibleActivityKey = getActivityKey(visibleActivities[visibleActivities.length - 1]); // Activity ID of the last visible activity in the list.
  const localize = useLocalizer();
  const scrollToEndButtonRef = useRef();

  const lastReadActivityKeyRef = useRef(lastVisibleActivityKey);
  const transcriptRoleDescription = localize('TRANSCRIPT_ARIA_ROLE_ALT');

  const allActivitiesRead = lastVisibleActivityKey === lastReadActivityKeyRef.current;

  // Perf: decouple from callbacks
  const visibleActivitiesForCallbacksRef = useRef();

  visibleActivitiesForCallbacksRef.current = visibleActivities;

  const handleScrollToEndButtonClick = useCallback(() => {
    const { current: visibleActivities } = visibleActivitiesForCallbacksRef;

    // After the "New message" button is clicked, focus on the first unread activity.
    const index = visibleActivities.findIndex(activity => getActivityKey(activity) === lastReadActivityKeyRef.current);

    if (~index) {
      const firstUnreadActivity = visibleActivities[index + 1];

      if (firstUnreadActivity) {
        return onFocusActivity(getActivityKey(firstUnreadActivity));
      }
    }

    const { current } = terminatorRef;

    current && current.focus();
  }, [lastReadActivityKeyRef, onFocusActivity, terminatorRef, visibleActivitiesForCallbacksRef]);

  if (sticky) {
    // If it is sticky, the user is at the bottom of the transcript, everything is read.
    // So mark the activity ID as read.
    lastReadActivityKeyRef.current = lastVisibleActivityKey;
  }

  // Finds where we should render the "New messages" button, in index. Returns -1 to hide the button.
  const renderSeparatorAfterIndex = useMemo(() => {
    // Don't show the button if:
    // - All activities have been read
    // - Currently animating towards bottom
    //   - "New messages" button must not flash when: 1. Type "help", 2. Scroll to top, 3. Type "help" again, 4. Expect the "New messages" button not flashy
    // - Hidden by style options
    // - It is already at the bottom (sticky)

    // Any changes to this logic, verify:
    // - "New messages" button should persist while programmatically scrolling to mid-point of the transcript:
    //   1. Type "help"
    //   2. Type "proactive", then immediately scroll to top
    //      Expect: the "New messages" button should appear
    //   3. Run hook "useScrollTo({ scrollTop: 500 })"
    //      Expect: when the scroll is animating to 500px, the "New messages" button should kept on the screen
    // - "New messages" button must not flashy:
    //   1. Type "help"
    //   2. Scroll to top
    //      Expect: no "New messages" button is shown
    //   3. Type "help" again
    //      Expect: "New messages" button must not flash-appear

    if (allActivitiesRead || animatingToEnd || hideScrollToEndButton || sticky) {
      return -1;
    }

    return visibleActivities.findIndex(activity => getActivityKey(activity) === lastReadActivityKeyRef.current);
  }, [allActivitiesRead, animatingToEnd, hideScrollToEndButton, lastReadActivityKeyRef, sticky, visibleActivities]);

  return (
    <React.Fragment>
      {renderSeparatorAfterIndex !== -1 && (
        <ScrollToEndButton onClick={handleScrollToEndButtonClick} ref={scrollToEndButtonRef} />
      )}
      {!!React.Children.count(children) && (
        <FocusRedirector className="webchat__basic-transcript__sentinel" redirectRef={terminatorRef} />
      )}
      <ReactScrollToBottomPanel className="webchat__basic-transcript__scrollable">
        <div aria-hidden={true} className="webchat__basic-transcript__filler" onFocus={onFocusFiller} />
        <ul
          aria-roledescription={transcriptRoleDescription}
          className={classNames(activitiesStyleSet + '', 'webchat__basic-transcript__transcript')}
          role="list"
        >
          {children}
        </ul>
        <BasicTypingIndicator />
      </ReactScrollToBottomPanel>
    </React.Fragment>
  );
};

InternalTranscriptScrollable.propTypes = {
  children: PropTypes.any.isRequired,
  onFocusActivity: PropTypes.func.isRequired,
  onFocusFiller: PropTypes.func.isRequired,
  terminatorRef: PropTypes.any.isRequired,
  visibleActivities: PropTypes.array.isRequired
};

const SetScroller = ({ activityElementsRef, scrollerRef }) => {
  const [
    { autoScrollSnapOnActivity, autoScrollSnapOnActivityOffset, autoScrollSnapOnPage, autoScrollSnapOnPageOffset }
  ] = useStyleOptions();
  // TOOD: This is a heavy hook because it call useSticky. Optimize the position for this hook.
  const [lastAcknowledgedActivity] = useAcknowledgedActivity();

  const lastAcknowledgedActivityRef = useRef(lastAcknowledgedActivity);

  lastAcknowledgedActivityRef.current = lastAcknowledgedActivity;

  scrollerRef.current = useCallback(
    ({ offsetHeight, scrollTop }) => {
      const patchedAutoScrollSnapOnActivity =
        typeof autoScrollSnapOnActivity === 'number'
          ? Math.max(0, autoScrollSnapOnActivity)
          : autoScrollSnapOnActivity
          ? 1
          : 0;
      const patchedAutoScrollSnapOnPage =
        typeof autoScrollSnapOnPage === 'number'
          ? Math.max(0, Math.min(1, autoScrollSnapOnPage))
          : autoScrollSnapOnPage
          ? 1
          : 0;
      const patchedAutoScrollSnapOnActivityOffset =
        typeof autoScrollSnapOnActivityOffset === 'number' ? autoScrollSnapOnActivityOffset : 0;
      const patchedAutoScrollSnapOnPageOffset =
        typeof autoScrollSnapOnPageOffset === 'number' ? autoScrollSnapOnPageOffset : 0;

      if (patchedAutoScrollSnapOnActivity || patchedAutoScrollSnapOnPage) {
        const { current: lastAcknowledgedActivity } = lastAcknowledgedActivityRef;

        const values = [];

        if (patchedAutoScrollSnapOnActivity) {
          const { element: nthUnacknowledgedActivityElement } =
            activityElementsRef.current[
              activityElementsRef.current.findIndex(({ activity }) => activity === lastAcknowledgedActivity) +
                patchedAutoScrollSnapOnActivity
            ] || {};

          if (nthUnacknowledgedActivityElement) {
            values.push(
              nthUnacknowledgedActivityElement.offsetTop +
                nthUnacknowledgedActivityElement.offsetHeight -
                offsetHeight -
                scrollTop +
                patchedAutoScrollSnapOnActivityOffset
            );
          }
        }

        if (patchedAutoScrollSnapOnPage) {
          const { element: firstUnacknowledgedActivityElement } =
            activityElementsRef.current[
              activityElementsRef.current.findIndex(({ activity }) => activity === lastAcknowledgedActivity) + 1
            ] || {};

          if (firstUnacknowledgedActivityElement) {
            values.push(
              firstUnacknowledgedActivityElement.offsetTop -
                scrollTop -
                offsetHeight * (1 - patchedAutoScrollSnapOnPage) +
                patchedAutoScrollSnapOnPageOffset
            );
          }
        }

        return values.reduce((minValue, value) => Math.min(minValue, value), Infinity);
      }

      return Infinity;
    },
    [
      activityElementsRef,
      autoScrollSnapOnActivity,
      autoScrollSnapOnActivityOffset,
      autoScrollSnapOnPage,
      autoScrollSnapOnPageOffset,
      lastAcknowledgedActivityRef
    ]
  );

  return false;
};

const BasicTranscript = ({ className }) => {
  debug || (debug = createDebug('<BasicTranscript>', { backgroundColor: 'yellow', color: 'black' }));

  const activityElementsRef = useRef([]);
  const scrollerRef = useRef(() => Infinity);

  const scroller = useCallback((...args) => scrollerRef.current(...args), [scrollerRef]);
  const [, setHonorReadReceipts] = useHonorReadReceipts();

  useEffect(() => {
    if (!document || !setHonorReadReceipts) {
      return;
    }

    const handleVisibilityChange = ({ target: { visibilityState } }) => {
      debug(`Visibility changed to %c${visibilityState}%c`, ...styleConsole('purple'));

      setHonorReadReceipts(visibilityState !== 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    handleVisibilityChange({ target: document });

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [setHonorReadReceipts]);

  return (
    <ReactScrollToBottomComposer scroller={scroller}>
      <SetScroller activityElementsRef={activityElementsRef} scrollerRef={scrollerRef} />
      <InternalTranscript activityElementsRef={activityElementsRef} className={className} />
    </ReactScrollToBottomComposer>
  );
};

BasicTranscript.defaultProps = {
  className: ''
};

BasicTranscript.propTypes = {
  className: PropTypes.string
};

export default BasicTranscript;
