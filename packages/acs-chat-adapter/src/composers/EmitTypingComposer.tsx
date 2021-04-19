import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo, useRef } from 'react';

import createDebug from '../utils/debug';
import EmitTypingContext from '../contexts/EmitTypingContext';
import styleConsole from '../utils/styleConsole';
import useACSSendTypingNotification from '../hooks/useACSSendTypingNotification';

const ACS_EMIT_TYPING_INTERVAL = 5000;

let debug;

// TODO: We should type "children" prop.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const EmitTypingComposer: FC<{ children: any }> = ({ children }) => {
  debug || (debug = createDebug('<EmitTypingComposer>', { backgroundColor: 'orange' }));

  const debugNumTypingSentRef = useRef<number>();
  const debugTypingStartRef = useRef<number>();
  const sendTypingIntervalRef = useRef<NodeJS.Timeout>();

  // TODO: ACS should support stop typing.
  const acsSendTypingNotification = useACSSendTypingNotification();

  const sendTypingNotification = useCallback(() => {
    debugNumTypingSentRef.current++;

    return acsSendTypingNotification();
  }, [acsSendTypingNotification]);

  const emitTyping = useMemo(
    () => (typing: boolean) => {
      if (typing) {
        if (!sendTypingIntervalRef.current) {
          debug('Start sending typing.');

          debugNumTypingSentRef.current = 0;
          debugTypingStartRef.current = Date.now();
          sendTypingIntervalRef.current = setInterval(sendTypingNotification, ACS_EMIT_TYPING_INTERVAL);

          sendTypingNotification();
        }
      } else {
        if (sendTypingIntervalRef.current) {
          clearInterval(sendTypingIntervalRef.current);
          sendTypingIntervalRef.current = undefined;

          debug(
            `Stopping sending typing after %c${debugNumTypingSentRef.current} signals%c and %c${
              Date.now() - debugTypingStartRef.current
            } ms%c.`,
            ...styleConsole('purple'),
            ...styleConsole('green')
          );
        }
      }
    },
    [sendTypingIntervalRef, sendTypingNotification]
  );

  return <EmitTypingContext.Provider value={emitTyping}>{children}</EmitTypingContext.Provider>;
};

EmitTypingComposer.defaultProps = {};

EmitTypingComposer.propTypes = {
  children: PropTypes.any.isRequired
};

export default EmitTypingComposer;
