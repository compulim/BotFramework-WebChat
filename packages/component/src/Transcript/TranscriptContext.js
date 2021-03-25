import { createContext } from 'react';

// This React context is internal to Web Chat and not designed to be exposed.
// const TranscriptContext = createContext<{
//   /** True, if one or more avatar initials appears on others side of the transcript, otherwise, false. */
//   hasOtherAvatar: boolean;

//   /** True, if one or more avatar initials appears on self side of the transcript, otherwise, false. */
//   hasSelfAvatar: boolean;
// }>(undefined);

const TranscriptContext = createContext(undefined);

TranscriptContext.displayName = 'WebChat.TranscriptContext';

export default TranscriptContext;
