import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import createErrorBoundaryMiddleware from './private/createErrorBoundaryMiddleware';
import templatePolymiddleware, {
  type InferHandler,
  type InferHandlerResult,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferRenderer,
  type InferRequest
} from './private/templatePolymiddleware';

const {
  createMiddleware: createSendBoxPolymiddleware,
  extractEnhancer: extractSendBoxEnhancer,
  Provider,
  Proxy,
  reactComponent: sendBoxComponent,
  useBuildRenderCallback: useBuildRenderSendBoxCallback
} = templatePolymiddleware<void, { readonly className?: string | undefined }>('sendBox');

type SendBoxPolymiddleware = InferMiddleware<typeof Provider>;
type SendBoxPolymiddlewareHandler = InferHandler<typeof Provider>;
type SendBoxPolymiddlewareHandlerResult = InferHandlerResult<typeof Provider>;
type SendBoxPolymiddlewareProps = InferProps<typeof Provider>;
type SendBoxPolymiddlewareRenderer = InferRenderer<typeof Provider>;
type SendBoxPolymiddlewareRequest = InferRequest<typeof Provider>;
type SendBoxPolymiddlewareProviderProps = InferProviderProps<typeof Provider>;

const sendBoxPolymiddlewareProxyPropsSchema = pipe(object({ className: optional(string()) }), readonly());

type SendBoxPolymiddlewareProxyProps = Readonly<InferInput<typeof sendBoxPolymiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const SendBoxPolymiddlewareProxy = memo(function SendBoxPolymiddlewareProxy(
  props: SendBoxPolymiddlewareProxyProps
) {
  const { className } = validateProps(sendBoxPolymiddlewareProxyPropsSchema, props);

  const request = useMemo(() => undefined, []);

  return <Proxy className={className} request={request} />;
});

const SendBoxPolymiddlewareProvider = memo(function SendBoxPolymiddlewareProvider({
  children,
  middleware
}: SendBoxPolymiddlewareProviderProps) {
  // Decorates middleware with <ErrorBoundary>.
  const middlewareWithErrorBoundary = useMemo(
    () =>
      Object.freeze([
        createErrorBoundaryMiddleware({
          createMiddleware: createSendBoxPolymiddleware,
          reactComponent: sendBoxComponent,
          where: 'send box polymiddleware'
        }),
        ...middleware
      ]),
    [middleware]
  );

  return <Provider middleware={middlewareWithErrorBoundary}>{children}</Provider>;
});

export {
  createSendBoxPolymiddleware,
  extractSendBoxEnhancer,
  sendBoxComponent,
  SendBoxPolymiddlewareProvider,
  SendBoxPolymiddlewareProxy,
  useBuildRenderSendBoxCallback,
  type SendBoxPolymiddleware,
  type SendBoxPolymiddlewareHandler,
  type SendBoxPolymiddlewareHandlerResult,
  type SendBoxPolymiddlewareProps,
  type SendBoxPolymiddlewareProviderProps,
  type SendBoxPolymiddlewareProxyProps,
  type SendBoxPolymiddlewareRenderer,
  type SendBoxPolymiddlewareRequest
};
