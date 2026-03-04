import templateMiddleware, {
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from './private/templateMiddleware';

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16. Use `createSendBoxPolymiddleware` instead.
 */
const template = templateMiddleware<void, { className?: string | undefined }>('sendBoxMiddleware');

const {
  createMiddleware: createSendBoxMiddleware,
  extractMiddleware: extractSendBoxMiddleware,
  Provider: SendBoxMiddlewareProvider,
  Proxy: SendBoxMiddlewareProxy
} = template;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16. Use `SendBoxPolymiddleware` instead.
 */
type SendBoxMiddleware = InferMiddleware<typeof template>;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16. Use `SendBoxPolymiddlewareProps` instead.
 */
type SendBoxMiddlewareProps = InferProps<typeof template>;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16. Use `SendBoxPolymiddlewareRequest` instead.
 */
type SendBoxMiddlewareRequest = InferRequest<typeof template>;

export {
  createSendBoxMiddleware,
  extractSendBoxMiddleware,
  SendBoxMiddlewareProvider,
  SendBoxMiddlewareProxy,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
};
