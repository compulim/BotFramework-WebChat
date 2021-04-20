import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect } from 'react';

import { default as ACSParticipantsContext } from '../contexts/ACSParticipantsContext';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatThreadSelector from '../hooks/useACSChatThreadSelector';
import useACSClients from '../hooks/useACSClients';

const PAGE_SIZE = 1000;
let debug;

const ACSParticipantsComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSParticipantsComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSClients();

  useEffect(() => {
    if (!declarativeChatThreadClient) {
      return;
    }

    // ESLint conflicts with Prettier.
    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();
      let numParticipants = 0;

      // This is required for fetching the initial list of participants.
      for await (const _ of declarativeChatThreadClient.listParticipants().byPage({ maxPageSize: PAGE_SIZE })) {
        numParticipants++;
      }

      debug(
        `Initial fetch done, got %c${numParticipants}%c participants, took %c${Date.now() - now} ms%c.`,
        ...styleConsole('purple'),
        ...styleConsole('green')
      );
    })();
  }, [declarativeChatThreadClient]);

  const participants = useACSChatThreadSelector(useCallback(state => state?.participants, []));

  return <ACSParticipantsContext.Provider value={participants}>{children}</ACSParticipantsContext.Provider>;
};

ACSParticipantsComposer.defaultProps = {
  children: undefined
};

ACSParticipantsComposer.propTypes = {
  children: PropTypes.any
};

export default ACSParticipantsComposer;
