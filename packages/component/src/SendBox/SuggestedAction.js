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

const { useDirection, useDisabled, usePerformCardAction, useSuggestedActions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-action': {
    '& .webchat__suggested-action__button': {
      display: 'flex',
      overflow: 'hidden' // Prevent image from leaking
    }
  }
};

const connectSuggestedAction = (...selectors) =>
  connectToWebChat(
    ({ clearSuggestedActions, disabled, language, onCardAction }, { displayText, text, type, value }) => ({
      click: () => {
        onCardAction({ displayText, text, type, value });
        type === 'openUrl' && clearSuggestedActions();
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
  disabled: disabledFromProps,
  displayText,
  image,
  imageAlt,
  text,
  type,
  value
}) => {
  const [_, setSuggestedActions] = useSuggestedActions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [globalDisabled] = useDisabled();
  const focus = useFocus();
  const focusRef = useRef();
  const localizeAccessKey = useLocalizeAccessKey();
  const performCardAction = usePerformCardAction();
  const scrollToEnd = useScrollToEnd();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const disabled = disabledFromProps || globalDisabled;

  const handleClick = useCallback(
    ({ target }) => {
      performCardAction({ displayText, text, type, value }, { target });

      // Since "openUrl" action do not submit, the suggested action buttons do not hide after click.
      type === 'openUrl' && setSuggestedActions([]);

      focus('sendBoxWithoutKeyboard');
      scrollToEnd();
    },
    [displayText, focus, performCardAction, scrollToEnd, setSuggestedActions, text, type, value]
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
        className="webchat__suggested-action__button"
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
        <span className="webchat__suggested-action__text">{buttonText}</span>
      </AccessibleButton>
    </div>
  );
};

SuggestedAction.defaultProps = {
  'aria-hidden': false,
  className: '',
  disabled: false,
  displayText: '',
  image: '',
  imageAlt: undefined,
  text: '',
  type: '',
  value: undefined
};

SuggestedAction.propTypes = {
  'aria-hidden': PropTypes.bool,
  buttonText: PropTypes.string.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  displayText: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  text: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
