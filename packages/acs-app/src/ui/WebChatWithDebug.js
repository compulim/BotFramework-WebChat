import './WebChatWithDebug.css';

import React, { useCallback } from 'react';
import { Components, hooks } from 'botframework-webchat';

import createDebug from '../util/debug';

const { BasicWebChat, Composer } = Components;
const { useEmitTypingIndicator, useObserveTranscriptFocus } = hooks;

let debug;

const Debug = () => {
  debug || (debug = createDebug('webchat:transcriptfocus', { backgroundColor: 'yellow', color: 'black' }));

  const handleTranscriptFocus = useCallback(event => event && debug(['got event'], [event]), []);

  useObserveTranscriptFocus(handleTranscriptFocus);

  return false;
};

const EmitTypingButton = () => {
  const emitTypingIndicator = useEmitTypingIndicator();
  const handleClick = useCallback(() => {
    emitTypingIndicator();
  }, [emitTypingIndicator]);

  return (
    <button className="webchat-with-debug__emit-typing-button" onClick={handleClick}>
      Emit typing
    </button>
  );
};

const WebChatWithDebug = ({ className, ...props }) => {
  return (
    <Composer {...props}>
      <BasicWebChat className={className} />
      <EmitTypingButton />
      <Debug />
    </Composer>
  );
};

export default WebChatWithDebug;
