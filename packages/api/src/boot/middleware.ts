export { PolymiddlewareComposer, type Polymiddleware } from '@msinternal/botframework-webchat-api-middleware';

// Separated import sections for easier templating.

export {
  activityComponent,
  ActivityPolymiddlewareProxy,
  createActivityPolymiddleware,
  useBuildRenderActivityCallback,
  type ActivityPolymiddleware,
  type ActivityPolymiddlewareHandler,
  type ActivityPolymiddlewareHandlerResult,
  type ActivityPolymiddlewareProps,
  type ActivityPolymiddlewareProxyProps,
  type ActivityPolymiddlewareRenderer,
  type ActivityPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  createErrorBoxPolymiddleware,
  errorBoxComponent,
  ErrorBoxPolymiddlewareProxy,
  useBuildRenderErrorBoxCallback,
  type ErrorBoxPolymiddleware,
  type ErrorBoxPolymiddlewareHandler,
  type ErrorBoxPolymiddlewareHandlerResult,
  type ErrorBoxPolymiddlewareProps,
  type ErrorBoxPolymiddlewareProxyProps,
  type ErrorBoxPolymiddlewareRenderer,
  type ErrorBoxPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  createSendBoxPolymiddleware,
  sendBoxComponent,
  SendBoxPolymiddlewareProxy,
  useBuildRenderSendBoxCallback,
  type SendBoxPolymiddleware,
  type SendBoxPolymiddlewareHandler,
  type SendBoxPolymiddlewareHandlerResult,
  type SendBoxPolymiddlewareProps,
  type SendBoxPolymiddlewareProxyProps,
  type SendBoxPolymiddlewareRenderer,
  type SendBoxPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export { default as createActivityPolymiddlewareFromLegacy } from '../legacy/createActivityPolymiddlewareFromLegacy';

export { default as createSendBoxPolymiddlewareFromLegacy } from '../legacy/createSendBoxPolymiddlewareFromLegacy';
