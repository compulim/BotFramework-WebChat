/* eslint complexity: ["error", 30] */

import { getMetadata, hooks } from 'botframework-webchat-api';
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

const { useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__stacked-layout': {
    position: 'relative', // This is to keep screen reader text in the destinated area.

    '& .webchat__stacked-layout__attachment-row, & .webchat__stacked-layout__main, & .webchat__stacked-layout__message-row, & .webchat__stacked-layout__status': {
      display: 'flex'
    },

    '& .webchat__stacked-layout__alignment-pad': {
      flexShrink: 0
    },

    '& .webchat__stacked-layout__attachment': {
      width: '100%'
    },

    '& .webchat__stacked-layout__avatar-gutter': {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    },

    '&.webchat__stacked-layout--from-user': {
      '& .webchat__stacked-layout__attachment-row, & .webchat__stacked-layout__main, & .webchat__stacked-layout__message-row, & .webchat__stacked-layout__status': {
        flexDirection: 'row-reverse'
      }
    },

    '& .webchat__stacked-layout__content': {
      flex: 1,

      // This is for bottom aligning an avatar with a message bubble shorter than the avatar.
      // Related to the test at activityGrouping.avatarMiddleware.atBottom.js.
      display: 'flex',
      flexDirection: 'column',

      // This "overflow: hidden" is to make sure text overflow will get clipped correctly.
      // Related to the test at basic.js "long URLs with keep-all".
      overflow: 'hidden'
    },

    '& .webchat__stacked-layout__nub-pad': {
      flexShrink: 0
    }
  }
};

const connectStackedLayout = (...selectors) =>
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
      language,

      // TODO: [P4] We want to deprecate botAvatarInitials/userAvatarInitials because they are not as helpful as avatarInitials
      botAvatarInitials,
      userAvatarInitials
    }),
    ...selectors
  );

const StackedLayout = ({
  activity,
  hideTimestamp,
  renderActivityStatus,
  renderAttachment,
  renderAvatar,
  showCallout
}) => {
  const [{ bubbleNubOffset, bubbleNubSize, bubbleFromUserNubOffset, bubbleFromUserNubSize }] = useStyleOptions();
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();
  const {
    attachments = [],
    channelData: { messageBack: { displayText: messageBackDisplayText } = {} } = {},
    text,
    textFormat
  } = activity;
  const { hasOthersAvatar, hasSelfAvatar } = useContext(TranscriptContext);
  const { senderName, who } = getMetadata(activity);
  const ariaLabelId = useUniqueId('webchat__stacked-layout__id');
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const showActivityStatus = typeof renderActivityStatus === 'function';

  const activityDisplayText = messageBackDisplayText || text;
  const fallbackNameForBot = localize('FALLBACK_NAME_FOR_BOTS');
  const fallbackNameForUsers = localize('FALLBACK_NAME_FOR_USERS');
  const self = who === 'self';

  const hasAvatarOnOtherSide = self ? hasOthersAvatar : hasSelfAvatar;
  const hasAvatarOnSameSide = self ? hasSelfAvatar : hasOthersAvatar;
  const nubOffset = self ? bubbleFromUserNubOffset : bubbleNubOffset;
  const nubSize = self ? bubbleFromUserNubSize : bubbleNubSize;
  const nubSizeOnOtherSide = self ? bubbleNubSize : bubbleFromUserNubSize;
  const patchedSenderName = senderName === '__BOT__' ? fallbackNameForBot : senderName || fallbackNameForUsers;

  const attachedAlt = self
    ? localize('ACTIVITY_YOU_ATTACHED_ALT')
    : localize('ACTIVITY_OTHERS_ATTACHED_ALT', patchedSenderName);
  const greetingAlt = self
    ? localize('ACTIVITY_YOU_SAID_ALT')
    : localize('ACTIVITY_OTHERS_SAID_ALT', patchedSenderName);
  const hasNub = typeof nubSize === 'number';
  const hasNubOnOtherSide = typeof nubSizeOnOtherSide === 'number';
  const showAvatar = showCallout && hasAvatarOnSameSide && !!renderAvatar;
  const topAlignedCallout = isZeroOrPositive(nubOffset);

  const extraTrailing = !hasAvatarOnOtherSide && hasNubOnOtherSide; // This is for bot message with user nub and no user avatar. And vice versa.
  const showNub = showCallout && hasNub && (topAlignedCallout || !attachments.length);

  return (
    <div
      aria-labelledby={activityDisplayText ? ariaLabelId : undefined}
      aria-roledescription="activity"
      className={classNames('webchat__stacked-layout', rootClassName, stackedLayoutStyleSet + '', {
        'webchat__stacked-layout--extra-trailing': extraTrailing,
        'webchat__stacked-layout--from-user': self,
        'webchat__stacked-layout--hide-avatar': hasAvatarOnSameSide && !showAvatar,
        'webchat__stacked-layout--hide-nub': hasNub && !showNub,
        'webchat__stacked-layout--no-message': !activityDisplayText,
        'webchat__stacked-layout--show-avatar': showAvatar,
        'webchat__stacked-layout--show-nub': showNub,
        'webchat__stacked-layout--top-callout': topAlignedCallout
      })}
      role="group"
    >
      <div className="webchat__stacked-layout__main">
        <div className="webchat__stacked-layout__avatar-gutter">{showAvatar && renderAvatar({ activity })}</div>
        <div className="webchat__stacked-layout__content">
          {!!activityDisplayText && (
            <div
              aria-roledescription="message"
              className="webchat__stacked-layout__message-row"
              // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
              /* eslint-disable-next-line react/forbid-dom-props */
              id={ariaLabelId}
              role="group"
            >
              <ScreenReaderText text={greetingAlt} />
              <Bubble
                className="webchat__stacked-layout__message"
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
            </div>
          )}
          {attachments.map((attachment, index) => (
            <div
              aria-roledescription="attachment"
              className={classNames('webchat__stacked-layout__attachment-row', {
                'webchat__stacked-layout__attachment-row--first': !index
              })}
              /* attachments do not have an ID, it is always indexed by number */
              /* eslint-disable-next-line react/no-array-index-key */
              key={index}
              role="group"
            >
              <ScreenReaderText text={attachedAlt} />
              <Bubble
                className="webchat__stacked-layout__attachment"
                fromUser={self}
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                nub={(hasAvatarOnSameSide || hasNub) && 'hidden'}
              >
                {renderAttachment({ activity, attachment })}
              </Bubble>
            </div>
          ))}
        </div>
        <div className="webchat__stacked-layout__alignment-pad" />
      </div>
      {showActivityStatus && (
        <div className="webchat__stacked-layout__status">
          <div className="webchat__stacked-layout__avatar-gutter" />
          <div className="webchat__stacked-layout__nub-pad" />
          {renderActivityStatus({ hideTimestamp })}
          <div className="webchat__stacked-layout__alignment-pad" />
        </div>
      )}
    </div>
  );
};

StackedLayout.defaultProps = {
  hideTimestamp: false,
  renderActivityStatus: false,
  renderAvatar: false,
  showCallout: true
};

StackedLayout.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array,
    channelData: PropTypes.shape({
      messageBack: PropTypes.shape({
        displayText: PropTypes.string
      })
    }),
    from: PropTypes.shape({
      role: PropTypes.string.isRequired
    }).isRequired,
    text: PropTypes.string,
    textFormat: PropTypes.string,
    timestamp: PropTypes.string,
    type: PropTypes.string.isRequired
  }).isRequired,
  hideTimestamp: PropTypes.bool,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  renderAttachment: PropTypes.func.isRequired,
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.func]),
  showCallout: PropTypes.bool
};

export default StackedLayout;

export { connectStackedLayout };
