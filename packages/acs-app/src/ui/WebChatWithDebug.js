import './WebChatWithDebug.css';

import React, { useCallback } from 'react';
import { Components, hooks } from 'botframework-webchat';

import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';

const { BasicWebChat, Composer } = Components;
const { useObserveTranscriptFocus } = hooks;

let debug;

const Debug = () => {
  debug || (debug = createDebug('webchat:transcriptfocus', { backgroundColor: 'yellow', color: 'black' }));

  const handleTranscriptFocus = useCallback(event => {
    if (!event) {
      return;
    } else if (event.activity) {
      debug(
        [`Focusing on activity %c${event.activity.channelData['webchat:key']}%c`, ...styleConsole('purple')],
        [{ activity: event.activity, event }]
      );
    } else {
      debug(['Got event'], [event]);
    }
  }, []);

  useObserveTranscriptFocus(handleTranscriptFocus);

  return false;
};

const WebChatWithDebug = ({ className, ...props }) => (
  <Composer {...props}>
    <BasicWebChat className={className} />
    <Debug />
  </Composer>
);

export default WebChatWithDebug;
