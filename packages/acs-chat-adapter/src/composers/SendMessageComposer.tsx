import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo } from 'react';

import createDebug from '../utils/debug';
import SendMessageContext from '../contexts/SendMessageContext';
import useACSClients from '../hooks/useACSClients';
import styleConsole from '../utils/styleConsole';

let debug;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SendMessage: FC<{ children: any }> = ({ children }) => {
  debug || (debug = createDebug('<SendMessage>', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSClients();

  const sendMessage = useCallback(
    (content: string) => {
      // ESLint conflicts with Prettier.
      // eslint-disable-next-line wrap-iife
      (async function () {
        const now = Date.now();

        await declarativeChatThreadClient.sendMessage({ content });

        debug(
          [
            `Message %c${content}%c has sent, took %c${Date.now() - now} ms%c to send.`,
            ...styleConsole('purple'),
            ...styleConsole('green')
          ],
          { content }
        );
      })();

      return undefined;
    },
    [declarativeChatThreadClient]
  );

  const context = useMemo(
    () => ({
      sendMessage
    }),
    [sendMessage]
  );

  return <SendMessageContext.Provider value={context}>{children}</SendMessageContext.Provider>;
};

SendMessage.defaultProps = {
  children: undefined
};

SendMessage.propTypes = {
  children: PropTypes.any
};

export default SendMessage;
