export const SET_CHAT_ADAPTER_DEPRECATION_BRIDGE = 'WEB_CHAT/SET_CHAT_ADAPTER_DEPRECATION_BRIDGE';

export type ChatAdapterDeprecationBridge = {
  // TODO: Do we need "sendMessage"?
  sendMessage: (message: string) => string;
};

export type SetChatAdapterDeprecationBridgeAction = {
  payload: ChatAdapterDeprecationBridge;
  type: typeof SET_CHAT_ADAPTER_DEPRECATION_BRIDGE;
};

export default function setChatAdapterDeprecationBridge(
  chatAdapterDeprecationBridge: ChatAdapterDeprecationBridge
): SetChatAdapterDeprecationBridgeAction {
  return {
    payload: chatAdapterDeprecationBridge,
    type: SET_CHAT_ADAPTER_DEPRECATION_BRIDGE
  };
}
