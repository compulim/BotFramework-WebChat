import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useMemo } from 'react';

import { default as ACSParticipantsContext } from '../contexts/ACSParticipantsContext';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatThreadSelector from '../hooks/useACSChatThreadSelector';
import useACSDeclaratives from '../hooks/useACSDeclaratives';

let debug;

const ACSParticipantsComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSParticipantsComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSDeclaratives();

  useEffect(() => {
    if (!declarativeChatThreadClient) {
      return;
    }

    // ESLint conflicts with Prettier.
    // eslint-disable-next-line wrap-iife
    (async function () {
      let numParticipants = 0;

      // This is required for fetching the initial list of participants.
      for await (const _ of declarativeChatThreadClient.listParticipants()) {
        numParticipants++;
      }

      debug(`Initial fetch done, got %c${numParticipants}%c participants.`, ...styleConsole('green'));
    })();
  }, [declarativeChatThreadClient]);

  const participantsMap = useACSChatThreadSelector(useCallback(state => state?.participants, []));

  // TODO: We should move this "map to array" logic inside other composer.
  const participants = useMemo(
    () =>
      participantsMap
        ? Array.from(participantsMap.entries())
            // eslint-disable-next-line no-magic-numbers
            .sort(([x], [y]) => (x > y ? 1 : x < y ? -1 : 0))
            .map(([, member]) => member)
        : [],
    [participantsMap]
  );

  return <ACSParticipantsContext.Provider value={participants}>{children}</ACSParticipantsContext.Provider>;
};

ACSParticipantsComposer.defaultProps = {
  children: undefined
};

ACSParticipantsComposer.propTypes = {
  children: PropTypes.any
};

export default ACSParticipantsComposer;
