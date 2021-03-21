import { useContext } from 'react';

import { WebChatReadReceipts } from '../types/WebChatReadReceipts';

import ReadReceiptsContext from '../context/ReadReceiptsContext';

export default function useReadReceipts(): [WebChatReadReceipts] {
  return [useContext(ReadReceiptsContext)];
}
