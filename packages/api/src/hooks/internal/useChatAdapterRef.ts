import { ChatAdapter } from 'botframework-webchat-core';
import { MutableRefObject, useContext } from 'react';

import ChatAdapterRefContext from '../../contexts/ChatAdapterRefContext';

export default function useChatAdapterRef(): MutableRefObject<ChatAdapter> {
  return useContext(ChatAdapterRefContext);
}
