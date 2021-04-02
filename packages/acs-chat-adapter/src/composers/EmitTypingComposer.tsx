import React, { FC, useMemo, useRef } from 'react';

import createDebug from '../utils/debug';
import EmitTypingContext from '../contexts/EmitTypingContext';
import useACSSendTypingNotification from '../hooks/useACSSendTypingNotification';
import styleConsole from '../utils/styleConsole';

const ACS_EMIT_TYPING_INTERVAL = 5000;

let debug;

const EmitTypingComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<EmitTypingComposer>', { backgroundColor: 'orange' }));

  const sendTypingIntervalRef = useRef<NodeJS.Timeout>();

  // TODO: ACS should support stop typing.
  const sendTypingNotification = useACSSendTypingNotification();

  const emitTyping = useMemo(
    () => (typing: boolean) => {
      debug(
        [`emitTyping(%c${typing}%c)`, ...styleConsole('green')],
        [{ sendTypingInterval: sendTypingIntervalRef.current, typing }]
      );

      if (typing) {
        if (!sendTypingIntervalRef.current) {
          sendTypingIntervalRef.current = setInterval(sendTypingNotification, ACS_EMIT_TYPING_INTERVAL);

          sendTypingNotification();
        }
      } else {
        if (sendTypingIntervalRef.current) {
          clearInterval(sendTypingIntervalRef.current);
          sendTypingIntervalRef.current = undefined;
        }
      }
    },
    [sendTypingIntervalRef, sendTypingNotification]
  );

  return <EmitTypingContext.Provider value={emitTyping}>{children}</EmitTypingContext.Provider>;
};

EmitTypingComposer.defaultProps = {};

EmitTypingComposer.propTypes = {};

export default EmitTypingComposer;
