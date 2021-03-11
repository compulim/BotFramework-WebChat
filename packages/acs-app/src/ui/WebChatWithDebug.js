import './WebChatWithDebug.css';

import React, { useCallback } from 'react';
import { Components, hooks } from 'botframework-webchat';

import createDebug from '../util/debug';

const { BasicWebChat, Composer } = Components;
const { useObserveTranscriptFocus } = hooks;

let debug;

const Debug = () => {
  debug || (debug = createDebug('webchat:transcriptfocus', { backgroundColor: 'yellow', color: 'black' }));

  const handleTranscriptFocus = useCallback(event => event && debug(['got event'], [event]), []);

  useObserveTranscriptFocus(handleTranscriptFocus);

  return false;
};

const WebChatWithDebug = ({ className, ...props }) => {
  return (
    <Composer {...props}>
      <BasicWebChat className={className} />
      <Debug />
    </Composer>
  );
};

export default WebChatWithDebug;
