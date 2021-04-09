/* eslint complexity: ["error", 30] */

import { getMetadata, hooks } from 'botframework-webchat-api';
import { useItemContainerCallbackRef, useScrollableCallbackRef } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import Bubble from './Bubble';
import connectToWebChat from '../connectToWebChat';
import isZeroOrPositive from '../Utils/isZeroOrPositive';
import ScreenReaderText from '../ScreenReaderText';
import textFormatToContentType from '../Utils/textFormatToContentType';
import TranscriptContext from '../Transcript/TranscriptContext';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useUniqueId from '../hooks/internal/useUniqueId';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__carousel-filmstrip': {
    display: 'flex',
    flexDirection: 'column',
    MsOverflowStyle: 'none',
    overflowX: 'scroll',
    overflowY: 'hidden',
    position: 'relative', // This is to keep screen reader text in the destinated area.
    touchAction: 'manipulation',
    WebkitOverflowScrolling: 'touch',

    '&::-webkit-scrollbar': {
      display: 'none'
    },

    '& .webchat__carousel-filmstrip__alignment-pad': {
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__attachment': {
      flex: 1
    },

    '& .webchat__carousel-filmstrip__attachments': {
      display: 'flex',
      listStyleType: 'none',
      margin: 0,
      padding: 0
    },

    '& .webchat__carousel-filmstrip__avatar': {
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__avatar-gutter': {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__complimentary': {
      display: 'flex'
    },

    '& .webchat__carousel-filmstrip__complimentary-content': {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column'
    },

    '& .webchat__carousel-filmstrip__content': {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column'
    },

    '& .webchat__carousel-filmstrip__filler': {
      flexGrow: 10000,
      flexShrink: 1
    },

    '& .webchat__carousel-filmstrip__main': {
      display: 'flex'
    },

    '& .webchat__carousel-filmstrip__message': {
      display: 'flex'
    },

    '& .webchat__carousel-filmstrip__nub-pad': {
      flexShrink: 0
    },

    '& .webchat__carousel-filmstrip__status': {
      display: 'flex'
    }
  }
};

const connectCarouselFilmStrip = (...selectors) =>
  connectToWebChat(
    (
      {
        language,
        styleSet: {
          options: { botAvatarInitials, userAvatarInitials }
        }
      },
      { activity: { from: { role } = {} } = {} }
    ) => ({
      avatarInitials: role === 'user' ? userAvatarInitials : botAvatarInitials,
      language
    }),
    ...selectors
  );

const CarouselFilmStrip = ({
  activity,
  className,
  hideTimestamp,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  showCallout
}) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ carouselFilmStrip: carouselFilmStripStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const { attachments = [], text, textFormat } = activity;
  const { hasOthersAvatar, hasSelfAvatar } = useContext(TranscriptContext);
  const { messageBackDisplayText, senderName, who } = getMetadata(activity);
  const ariaLabelId = useUniqueId('webchat__carousel-filmstrip__id');
  const itemContainerCallbackRef = useItemContainerCallbackRef();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollableCallbackRef = useScrollableCallbackRef();
  const showActivityStatus = typeof renderActivityStatus === 'function';

  const activityDisplayText = messageBackDisplayText || text;
  const fallbackDisplayNameForBot = localize('FALLBACK_DISPLAY_NAME_FOR_BOTS');
  const fallbackDisplayNameForUsers = localize('FALLBACK_DISPLAY_NAME_FOR_USERS');
  const self = who === 'self';

  const hasAvatarOnSameSide = self ? hasSelfAvatar : hasOthersAvatar;
  const nubOffset = self ? bubbleFromUserNubOffset : bubbleNubOffset;
  const nubSize = self ? bubbleFromUserNubSize : bubbleNubSize;
  const nubSizeOnOtherSide = self ? bubbleNubSize : bubbleFromUserNubSize;
  const patchedDisplayName =
    senderName === '__BOT__' ? fallbackDisplayNameForBot : senderName || fallbackDisplayNameForUsers;

  const attachedAlt = self
    ? localize('ACTIVITY_YOU_ATTACHED_ALT')
    : localize('ACTIVITY_OTHERS_ATTACHED_ALT', patchedDisplayName);
  const greetingAlt = self
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_OTHERS_SAID_ALT', patchedDisplayName);
  const hasNub = typeof nubSize === 'number';
  const hasNubOnOtherSide = typeof nubSizeOnOtherSide === 'number';
  const showAvatar = showCallout && hasAvatarOnSameSide && !!renderAvatar;
  const topAlignedCallout = isZeroOrPositive(nubOffset);

  const extraTrailing = !hasOthersAvatar && hasNubOnOtherSide; // This is for bot message with user nub and no user avatar. And vice versa.
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments.length);

  return (
    <div
      aria-labelledby={ariaLabelId}
      className={classNames(
        'webchat__carousel-filmstrip',
        {
          'webchat__carousel-filmstrip--extra-trailing': extraTrailing,
          'webchat__carousel-filmstrip--hide-avatar': hasAvatarOnSameSide && !showAvatar,
          'webchat__carousel-filmstrip--hide-nub': hasNub && !showNub,
          'webchat__carousel-filmstrip--no-message': !activityDisplayText,
          'webchat__carousel-filmstrip--rtl': direction === 'rtl',
          'webchat__carousel-filmstrip--show-avatar': showAvatar,
          'webchat__carousel-filmstrip--show-nub': showNub,
          'webchat__carousel-filmstrip--top-callout': topAlignedCallout
        },
        'react-film__filmstrip',
        rootClassName,
        carouselFilmStripStyleSet + '',
        (className || '') + ''
      )}
      ref={scrollableCallbackRef}
      role="group"
    >
      <div className="webchat__carousel-filmstrip__main">
        <div className="webchat__carousel-filmstrip__avatar-gutter">{showAvatar && renderAvatar({ activity })}</div>
        <div className="webchat__carousel-filmstrip__content">
          {!!activityDisplayText && (
            <div
              aria-roledescription="message"
              className="webchat__carousel-filmstrip__message"
              // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
              /* eslint-disable-next-line react/forbid-dom-props */
              id={ariaLabelId}
              role="group"
            >
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className="webchat__carousel-filmstrip__bubble"
                fromUser={self}
                nub={showNub || ((hasAvatarOnSameSide || hasNub) && 'hidden')}
              >
                {renderAttachment({
                  activity,
                  attachment: {
                    content: activityDisplayText,
                    contentType: textFormatToContentType(textFormat)
                  }
                })}
              </Bubble>
              <div className="webchat__carousel-filmstrip__filler" />
            </div>
          )}
          <div className="webchat__carousel-filmstrip__complimentary">
            <div className="webchat__carousel-filmstrip__nub-pad" />
            <div className="webchat__carousel-filmstrip__complimentary-content c">
              <ul
                className="webchat__carousel-filmstrip__attachments react-film__filmstrip__list"
                ref={itemContainerCallbackRef}
              >
                {attachments.map((attachment, index) => (
                  <li
                    aria-roledescription="attachment"
                    className="webchat__carousel-filmstrip__attachment react-film__filmstrip__item"
                    /* Attachments do not have an ID; it is always indexed by number */
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={index}
                    role="listitem"
                  >
                    <ScreenReaderText text={attachedAlt} />
                    {/* eslint-disable-next-line react/no-array-index-key */}
                    <Bubble fromUser={self} key={index} nub={false}>
                      {renderAttachment({ activity, attachment })}
                    </Bubble>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="webchat__carousel-filmstrip__alignment-pad" />
      </div>
      {showActivityStatus && (
        <div className="webchat__carousel-filmstrip__status">
          <div className="webchat__carousel-filmstrip__avatar-gutter" />
          <div className="webchat__carousel-filmstrip__nub-pad" />
          {renderActivityStatus({ hideTimestamp })}
        </div>
      )}
    </div>
  );
};

CarouselFilmStrip.defaultProps = {
  className: '',
  hideTimestamp: false,
  renderActivityStatus: false,
  renderAvatar: false,
  showCallout: false
};

CarouselFilmStrip.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.string,
    timestamp: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  hideTimestamp: PropTypes.bool,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  renderAttachment: PropTypes.func.isRequired,
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  showCallout: PropTypes.bool
};

export default CarouselFilmStrip;

export { connectCarouselFilmStrip };
