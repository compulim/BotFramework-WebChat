import {
  ChatAdapterDeprecationBridge,
  SET_CHAT_ADAPTER_DEPRECATION_BRIDGE,
  SetChatAdapterDeprecationBridgeAction
} from '../actions/setChatAdapterDeprecationBridge';

export default function chatAdapterDeprecationBridge(
  state: ChatAdapterDeprecationBridge = null,
  { payload, type }: SetChatAdapterDeprecationBridgeAction
) {
  if (type === SET_CHAT_ADAPTER_DEPRECATION_BRIDGE) {
    state = payload;
  }

  return state;
}
