import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import AccessibleButton from '../Utils/AccessibleButton';
import connectToWebChat from '../connectToWebChat';
import useFocus from '../hooks/useFocus';
import useFocusAccessKeyEffect from '../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useDirection, useDisabled, usePerformCardAction, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-action': {
    '& .webchat__suggested-action__button': {
      display: 'flex',
      overflow: 'hidden' // Prevent image from leaking; object-fit does not work with IE11
    }
  }
};

const connectSuggestedAction = (...selectors) =>
  connectToWebChat(
    ({ disabled, language, onCardAction }, { displayText, text, type, value }) => ({
      click: () => {
        onCardAction({ displayText, text, type, value });
      },
      disabled,
      language
    }),
    ...selectors
  );

const SuggestedAction = ({
  'aria-hidden': ariaHidden,
  buttonText,
  className,
  displayText,
  image,
  imageAlt,
  text,
  textClassName,
  type,
  value
}) => {
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [{ suggestedActionsStackedLayoutButtonTextWrap }] = useStyleOptions();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [disabled] = useDisabled();
  const focus = useFocus();
  const focusRef = useRef();
  const localizeAccessKey = useLocalizeAccessKey();
  const performCardAction = usePerformCardAction();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollToEnd = useScrollToEnd();

  const handleClick = useCallback(
    ({ target }) => {
      performCardAction({ displayText, text, type, value }, { target });
      focus('sendBoxWithoutKeyboard');
      scrollToEnd();
    },
    [displayText, focus, performCardAction, scrollToEnd, text, type, value]
  );

  useFocusAccessKeyEffect(accessKey, focusRef);

  return (
    <div
      aria-hidden={ariaHidden}
      className={classNames(
        'webchat__suggested-action',
        { 'webchat__suggested-action--rtl': direction === 'rtl' },
        rootClassName,
        suggestedActionStyleSet + '',
        (className || '') + ''
      )}
    >
      <AccessibleButton
        {...(accessKey ? { 'aria-keyshortcuts': localizeAccessKey(accessKey) } : {})}
        className={classNames('webchat__suggested-action__button', {
          'webchat__suggested-action--wrapping': suggestedActionsStackedLayoutButtonTextWrap
        })}
        disabled={disabled}
        onClick={handleClick}
        ref={focusRef}
        type="button"
      >
        {image && (
          <img
            alt={imageAlt}
            className={classNames(
              'webchat__suggested-action__image',
              direction === 'rtl' && 'webchat__suggested-action__image--rtl'
            )}
            src={image}
          />
        )}
        <span className={classNames('webchat__suggested-action__text', (textClassName || '') + '')}>{buttonText}</span>
      </AccessibleButton>
    </div>
  );
};

SuggestedAction.defaultProps = {
  'aria-hidden': false,
  className: '',
  displayText: '',
  image: '',
  imageAlt: undefined,
  text: '',
  textClassName: '',
  type: '',
  value: undefined
};

SuggestedAction.propTypes = {
  'aria-hidden': PropTypes.bool,
  buttonText: PropTypes.string.isRequired,
  className: PropTypes.string,
  displayText: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  text: PropTypes.string,
  textClassName: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
