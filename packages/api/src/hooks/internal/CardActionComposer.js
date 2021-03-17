import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import applyMiddleware from '../middleware/applyMiddleware';
// import createDebug from '../utils/debug';
import createDefaultCardActionMiddleware from '../middleware/createDefaultCardActionMiddleware';
import observableToPromise from '../utils/observableToPromise';
import singleToArray from '../utils/singleToArray';
import usePostActivity from '../usePostActivity';
import useSendMessage from '../useSendMessage';
import useSendMessageBack from '../useSendMessageBack';
import useSendPostBack from '../useSendPostBack';
import WebChatCardActionContext from './WebChatCardActionContext';
import useClearSuggestedActions from '../useClearSuggestedActions';

// let debug;

function createCardActionContext({ cardActionMiddleware, clearSuggestedActions, directLine, setup }) {
  const runMiddleware = applyMiddleware(
    'card action',
    ...singleToArray(cardActionMiddleware),
    createDefaultCardActionMiddleware()
  )(setup);

  return {
    onCardAction: (cardAction, { target } = {}) => {
      // When handling card action from clicking on a suggested action, we need to clear suggested actions manually.
      // This is because card action maybe "openURL", which does not trigger post activity.
      // Thus, without post activity, suggested actions will not be cleared automatically.
      clearSuggestedActions();

      runMiddleware({
        cardAction,
        getSignInUrl:
          cardAction.type === 'signin'
            ? () => {
                const { value } = cardAction;

                if (directLine && directLine.getSessionId) {
                  /**
                   * @todo TODO: [P3] We should change this one to async/await.
                   *       This is the first place in this project to use async.
                   *       Thus, we need to add @babel/plugin-transform-runtime and @babel/runtime.
                   */
                  return observableToPromise(directLine.getSessionId()).then(
                    sessionId => `${value}${encodeURIComponent(`&code_challenge=${sessionId}`)}`
                  );
                }

                console.warn('botframework-webchat: OAuth is not supported on this Direct Line adapter.');

                return value;
              }
            : null,
        target
      });
    }
  };
}

// TODO: How to replace directLine?
const CardActionComposer = ({ cardActionMiddleware, children, directLine }) => {
  // debug || (debug = createDebug('CardActionComposer', { backgroundColor: 'red' }));

  const clearSuggestedActions = useClearSuggestedActions();
  const postActivity = usePostActivity(); // Deprecated?
  const sendMessage = useSendMessage();
  const sendMessageBack = useSendMessageBack();
  const sendPostBack = useSendPostBack();

  const cardActionContext = useMemo(
    () =>
      createCardActionContext({
        cardActionMiddleware,
        clearSuggestedActions,
        directLine,
        setup: {
          dispatch: () => {
            throw new Error('not implemented');
          },
          postActivity, // Deprecated?
          sendMessage,
          sendMessageBack,
          sendPostBack
        }
      }),
    [cardActionMiddleware, clearSuggestedActions, directLine, postActivity, sendMessage, sendMessageBack, sendPostBack]
  );

  // debug(['Render'], [cardActionContext]);

  return <WebChatCardActionContext.Provider value={cardActionContext}>{children}</WebChatCardActionContext.Provider>;
};

CardActionComposer.defaultProps = {
  cardActionMiddleware: undefined,
  children: undefined,
  directLine: undefined
};

CardActionComposer.propTypes = {
  cardActionMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  children: PropTypes.any,
  directLine: PropTypes.shape({
    getSessionId: PropTypes.func
  })
};

export default CardActionComposer;
