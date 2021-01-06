/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import BasicFilm, { createBasicStyleSet as createBasicStyleSetForReactFilm } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SuggestedAction from './SuggestedAction';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useNonce from '../hooks/internal/useNonce';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useUniqueId from '../hooks/internal/useUniqueId';

const { useDirection, useLocalizer, useStyleOptions, useSuggestedActions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-actions': {
    '&.webchat__suggested-actions--flow-layout, &.webchat__suggested-actions--inline-flow-layout': {
      display: 'flex',
      flexWrap: 'wrap'
    },

    '&.webchat__suggested-actions--stack-layout .webchat__suggested-actions__stack': {
      display: 'flex',
      flexDirection: 'column'
    }
  }
};

function suggestedActionText({ displayText, title, type, value }) {
  if (type === 'messageBack') {
    return title || displayText;
  } else if (title) {
    return title;
  } else if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

const connectSuggestedActions = (...selectors) =>
  connectToWebChat(
    ({ language, suggestedActions }) => ({
      language,
      suggestedActions
    }),
    ...selectors
  );

const SuggestedActionCarouselContainer = ({ children, className, screenReaderText }) => {
  const [
    {
      suggestedActionsCarouselFlipperBoxWidth,
      suggestedActionsCarouselFlipperCursor,
      suggestedActionsCarouselFlipperSize
    }
  ] = useStyleOptions();
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const [nonce] = useNonce();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const filmStyleSet = useMemo(
    () =>
      createBasicStyleSetForReactFilm({
        cursor: suggestedActionsCarouselFlipperCursor,
        flipperBoxWidth: suggestedActionsCarouselFlipperBoxWidth,
        flipperSize: suggestedActionsCarouselFlipperSize
      }),
    [
      suggestedActionsCarouselFlipperBoxWidth,
      suggestedActionsCarouselFlipperCursor,
      suggestedActionsCarouselFlipperSize
    ]
  );

  return (
    // TODO: The content of suggested actions should be the labelled by the activity.
    //       That means, when the user focus into the suggested actions, it should read similar to "Bot said, what's your preference of today? Suggested actions has items: apple button, orange button, banana button."
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--carousel-layout',
        { 'webchat__suggested-actions--rtl': direction === 'rtl' },
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
        <BasicFilm
          autoCenter={false}
          className="webchat__suggested-actions__carousel"
          dir={direction}
          flipperBlurFocusOnClick={true}
          nonce={nonce}
          showDots={false}
          showScrollBar={false}
          styleSet={filmStyleSet}
        >
          {children}
        </BasicFilm>
      )}
    </div>
  );
};

SuggestedActionCarouselContainer.defaultProps = {
  children: undefined,
  className: undefined
};

SuggestedActionCarouselContainer.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  screenReaderText: PropTypes.string.isRequired
};

const SuggestedActionFlowContainer = ({ children, className, screenReaderText }) => {
  const [{ suggestedActionLayout }] = useStyleOptions();
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        {
          'webchat__suggested-actions--flow-layout': suggestedActionLayout === 'flow',
          'webchat__suggested-actions--inline-flow-layout': suggestedActionLayout === 'inline flow'
        },
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {React.Children.map(children, child => (
        <div className="webchat__suggested-actions__item">{child}</div>
      ))}
    </div>
  );
};

SuggestedActionFlowContainer.defaultProps = {
  children: undefined,
  className: undefined
};

SuggestedActionFlowContainer.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  screenReaderText: PropTypes.string.isRequired
};

const SuggestedActionStackedContainer = ({ children, className, screenReaderText }) => {
  const [{ suggestedActionLayout }] = useStyleOptions();
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        {
          'webchat__suggested-actions--stacked-layout': suggestedActionLayout === 'stacked',
          'webchat__suggested-actions--inline-stacked-layout': suggestedActionLayout === 'inline stacked'
        },
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
        <div className="webchat__suggested-actions__stack">{children}</div>
      )}
    </div>
  );
};

SuggestedActionStackedContainer.defaultProps = {
  children: undefined,
  className: undefined
};

SuggestedActionStackedContainer.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  screenReaderText: PropTypes.string.isRequired
};

const SuggestedActions = ({ className, disabled, suggestedActions }) => {
  const [{ suggestedActionLayout }] = useStyleOptions();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [suggestedActionsFromHooks] = useSuggestedActions();
  const localize = useLocalizer();
  const localizeAccessKey = useLocalizeAccessKey();

  if (!suggestedActions) {
    // TODO: [P0] Fill the link
    console.warn(
      'botframework-webchat: <SuggestedActions> now requires passing a "suggestedActions" prop. Please see this link for details, https://.../.'
    );

    suggestedActions = suggestedActionsFromHooks;
  }

  const screenReaderText = localize(
    'SUGGESTED_ACTIONS_ALT',
    suggestedActions.length
      ? accessKey
        ? localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT_AND_ACCESS_KEY', localizeAccessKey(accessKey))
        : localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT')
      : localize('SUGGESTED_ACTIONS_ALT_NO_CONTENT')
  );

  const children = suggestedActions.map(({ displayText, image, imageAltText, text, title, type, value }, index) => (
    <SuggestedAction
      ariaHidden={true}
      buttonText={suggestedActionText({ displayText, title, type, value })}
      className="webchat__suggested-actions__button"
      disabled={disabled}
      displayText={displayText}
      image={image}
      imageAlt={imageAltText}
      key={index}
      text={text}
      type={type}
      value={value}
    />
  ));

  if (suggestedActionLayout === 'flow' || suggestedActionLayout === 'inline flow') {
    return (
      <SuggestedActionFlowContainer className={className} screenReaderText={screenReaderText}>
        {children}
      </SuggestedActionFlowContainer>
    );
  } else if (suggestedActionLayout === 'stacked' || suggestedActionLayout === 'inline stacked') {
    return (
      <SuggestedActionStackedContainer className={className} screenReaderText={screenReaderText}>
        {children}
      </SuggestedActionStackedContainer>
    );
  }

  return (
    <SuggestedActionCarouselContainer className={className} screenReaderText={screenReaderText}>
      {children}
    </SuggestedActionCarouselContainer>
  );
};

SuggestedActions.defaultProps = {
  className: '',
  disabled: false
};

SuggestedActions.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  suggestedActions: PropTypes.arrayOf(
    PropTypes.shape({
      displayText: PropTypes.string,
      image: PropTypes.string,
      imageAltText: PropTypes.string,
      text: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.string.isRequired,
      value: PropTypes.any
    })
  ).isRequired
};

export default SuggestedActions;

export { connectSuggestedActions };
