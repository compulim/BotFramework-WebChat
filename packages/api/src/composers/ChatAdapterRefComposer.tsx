import { ChatAdapter } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useRef } from 'react';

import ChatAdapterRefContext from '../contexts/ChatAdapterRefContext';

const ChatAdapterRefComposer: FC<{ children: any } & ChatAdapter> = ({
  activities,
  children,
  emitTyping,
  honorReadReceipts,
  notifications,
  resend,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setHonorReadReceipts,
  typingUsers,
  userId,
  username
}) => {
  const ref = useRef<ChatAdapter>({});

  ref.current.activities = activities;
  ref.current.emitTyping = emitTyping;
  ref.current.honorReadReceipts = honorReadReceipts;
  ref.current.notifications = notifications;
  ref.current.resend = resend;
  ref.current.sendEvent = sendEvent;
  ref.current.sendFiles = sendFiles;
  ref.current.sendMessage = sendMessage;
  ref.current.sendMessageBack = sendMessageBack;
  ref.current.sendPostBack = sendPostBack;
  ref.current.setHonorReadReceipts = setHonorReadReceipts;
  ref.current.typingUsers = typingUsers;
  ref.current.userId = userId;
  ref.current.username = username;

  return <ChatAdapterRefContext.Provider value={ref}>{children}</ChatAdapterRefContext.Provider>;
};

ChatAdapterRefComposer.defaultProps = {
  activities: undefined,
  children: undefined,
  emitTyping: undefined,
  honorReadReceipts: undefined,
  notifications: undefined,
  resend: undefined,
  sendEvent: undefined,
  sendFiles: undefined,
  sendMessage: undefined,
  sendMessageBack: undefined,
  sendPostBack: undefined,
  setHonorReadReceipts: undefined,
  typingUsers: undefined,
  userId: undefined,
  username: undefined
};

ChatAdapterRefComposer.propTypes = {
  activities: PropTypes.any,
  children: PropTypes.any,
  emitTyping: PropTypes.any,
  honorReadReceipts: PropTypes.any,
  notifications: PropTypes.any,
  resend: PropTypes.any,
  sendEvent: PropTypes.any,
  sendFiles: PropTypes.any,
  sendMessage: PropTypes.any,
  sendMessageBack: PropTypes.any,
  sendPostBack: PropTypes.any,
  setHonorReadReceipts: PropTypes.any,
  typingUsers: PropTypes.any,
  userId: PropTypes.any,
  username: PropTypes.any
};

export default ChatAdapterRefComposer;
