import { useCallback } from 'react';

import { warn } from '../utils/warn';
import useSendEvent from './useSendEvent';
import useSendFiles from './useSendFiles';
import useSendMessage from './useSendMessage';
import useSendMessageBack from './useSendMessageBack';
import useSendPostBack from './useSendPostBack';

export default function usePostActivity() {
  // TODO: Add deprecation warning.
  const sendEvent = useSendEvent();
  const sendFiles = useSendFiles();
  const sendMessage = useSendMessage();
  const sendMessageBack = useSendMessageBack();
  const sendPostBack = useSendPostBack();

  return useCallback(
    activity => {
      // TODO: How to handle channel data?
      const { channelData = {} } = activity;

      // TODO: Rename to "webchat:message-back:display-text"
      if (channelData.messageBack) {
        if (sendMessageBack) {
          return sendMessageBack(activity.value, activity.text, channelData.messageBack.displayText);
        }

        return warn('This chat adapter does not support sending "messageBack" activity.');
      } else if (channelData.postBack) {
        if (sendPostBack) {
          return sendPostBack(activity.text || activity.value);
        }

        return warn('This chat adapter does not support sending "postBack" activity.');
      } else if (activity.attachments) {
        if (sendFiles) {
          return sendFiles(
            activity.attachments.map(({ contentUrl, name, thumbnailUrl }, index) => ({
              name,
              size: (channelData.attachmentSizes || [])[index],
              thumbnail: thumbnailUrl,
              url: contentUrl
            }))
          );
        }

        return warn('This chat adapter does not support sending activity with attachments.');
      } else if (activity.type === 'message') {
        if (sendMessage) {
          return sendMessage(activity.text);
        }

        return warn('This chat adapter does not support sending plain text activity.');
      } else if (activity.type === 'event') {
        if (sendEvent) {
          return sendEvent();
        }

        return warn('This chat adapter does not support sending event activity.');
      }
    },
    [sendEvent, sendFiles, sendMessage, sendMessageBack, sendPostBack]
  );
}
