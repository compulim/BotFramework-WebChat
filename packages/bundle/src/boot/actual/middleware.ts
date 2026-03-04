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
  type ActivityPolymiddlewareRequest,
  type Polymiddleware
} from 'botframework-webchat-api/middleware';

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
} from 'botframework-webchat-api/middleware';

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
} from 'botframework-webchat-api/middleware';

export { createActivityPolymiddlewareFromLegacy } from 'botframework-webchat-api/middleware';
export { createSendBoxPolymiddlewareFromLegacy } from 'botframework-webchat-api/middleware';
