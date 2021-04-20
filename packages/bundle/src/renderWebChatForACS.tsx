import { ACSChatAdapter } from 'botframework-webchat-chat-adapter-acs';
import React from 'react';
import ReactDOM from 'react-dom';

// TODO: We should import type UserProfiles for botframework-webchat-chat-adapter-acs.

export default function renderWebChatForACS(
  ReactWebChat: any,
  {
    endpointURL,
    threadId,
    token,
    userProfiles,
    ...props
  }: {
    endpointURL: string;
    threadId: string;
    token: string;
    userProfiles: {
      [userId: string]: {
        image?: string;
        initials?: string;
        name?: string;
      };
    };
  },
  element: HTMLElement
) {
  ReactDOM.render(
    <ACSChatAdapter endpointURL={endpointURL} threadId={threadId} token={token} userProfiles={userProfiles}>
      {chatProps => <ReactWebChat {...chatProps} {...props} />}
    </ACSChatAdapter>,
    element
  );
}
