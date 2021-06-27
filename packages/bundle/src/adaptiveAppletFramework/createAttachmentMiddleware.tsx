import { AttachmentMiddleware } from 'botframework-webchat-api';
import React from 'react';

import AdaptiveAppletFrameworkAttachment from './AdaptiveAppletFrameworkAttachment';

export default function createAttachmentMiddleware(): AttachmentMiddleware {
  // This is not returning a React component, but a render function.
  /* eslint-disable-next-line react/display-name */
  return () => next => (...args) => {
    const [{ attachment }] = args;

    return attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
      <AdaptiveAppletFrameworkAttachment attachment={attachment} />
    ) : (
      next(...args)
    );
  };
}
