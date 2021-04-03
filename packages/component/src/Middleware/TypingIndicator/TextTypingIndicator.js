import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const { useLocalizer } = hooks;

const TYPING_INDICATOR_MANY_IDS = {
  few: 'TYPING_INDICATOR_MANY_FEW',
  many: 'TYPING_INDICATOR_MANY_MANY',
  one: 'TYPING_INDICATOR_MANY_ONE',
  other: 'TYPING_INDICATOR_MANY_OTHER',
  two: 'TYPING_INDICATOR_MANY_TWO'
};

const TextTypingIndicator = ({ activeTyping }) => {
  const [{ textTypingIndicator: textTypingIndicatorStyleSet }] = useStyleSet();
  const activeTypingEntries = Object.entries(activeTyping);
  const localize = useLocalizer();
  const localizeWithPlural = useLocalizer({ plural: true });

  const fallbackNameForBot = localize('FALLBACK_NAME_FOR_BOTS');

  // We assume it is very unlikely that the time could collide with each other, so we don't second-sort by names.
  const sortedNames = activeTypingEntries
    .sort(([, { at: x }, { at: y }]) => x - y)
    .map(([userId, { name }], index) =>
      name !== '__BOT__' ? name || userId : index ? fallbackNameForBot.toLocaleLowerCase() : fallbackNameForBot
    );

  const { length } = sortedNames;
  let text;

  if (length === 1) {
    text = localize('TYPING_INDICATOR_ONE', sortedNames[0]);
    // eslint-disable-next-line no-magic-numbers
  } else if (length === 2) {
    text = localize('TYPING_INDICATOR_TWO', ...sortedNames);
  } else if (length) {
    // eslint-disable-next-line no-magic-numbers
    text = localizeWithPlural(TYPING_INDICATOR_MANY_IDS, sortedNames.length - 2, sortedNames[0], sortedNames[1]);
  }

  return <div className={classNames('webchat__text-typing-indicator', textTypingIndicatorStyleSet + '')}>{text}</div>;
};

TextTypingIndicator.propTypes = {
  activeTyping: PropTypes.objectOf(
    PropTypes.shape({
      at: PropTypes.number,
      name: PropTypes.string
    })
  ).isRequired
};

export default TextTypingIndicator;
