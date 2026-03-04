import {
  createSendBoxPolymiddleware,
  sendBoxComponent,
  type SendBoxPolymiddleware
} from '@msinternal/botframework-webchat-api-middleware';
import { type LegacySendBoxMiddleware } from '@msinternal/botframework-webchat-api-middleware/legacy';
import { composeEnhancer, type Enhancer } from 'handler-chain';
import { type ReactNode } from 'react';
import {
  custom,
  function_,
  never,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  string,
  type InferInput
} from 'valibot';

import LegacySendBoxBridge from './LegacySendBoxBridge';

type LegacySendBoxRenderFunction = (props: { readonly className?: string | undefined }) => ReactNode;
type LegacySendBoxComponent = ReactNode;

const legacySendBoxBridgeComponentPropsSchema = pipe(
  object({
    children: optional(never()),
    className: optional(string()),
    render: custom<LegacySendBoxRenderFunction>(value => safeParse(function_(), value).success)
  }),
  readonly()
);

type LegacySendBoxBridgeComponentProps = Readonly<
  InferInput<typeof legacySendBoxBridgeComponentPropsSchema> & { children?: never }
>;

/**
 * Polyfill legacy sendBox middleware into a polymiddleware.
 *
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2028-03-04.
 * @param middleware An array of legacy sendBox middleware.
 * @returns A polymiddleware composed by legacy sendBox middleware.
 */
function createSendBoxPolymiddlewareFromLegacy(
  ...middleware: readonly LegacySendBoxMiddleware[]
): SendBoxPolymiddleware {
  const legacyEnhancer: Enhancer<LegacySendBoxComponent, void> = composeEnhancer<LegacySendBoxComponent, void>(
    ...(middleware.map(middleware => middleware()) as Enhancer<LegacySendBoxComponent, void>[])
  );

  return createSendBoxPolymiddleware(next => {
    const legacyHandler = legacyEnhancer(() => {
      const handler = next();

      return !!handler && (() => handler.render({}));
    });

    return () => {
      const legacyResult = legacyHandler();

      return legacyResult ? sendBoxComponent(LegacySendBoxBridge, { render: () => legacyResult }) : undefined;
    };
  });
}

export default createSendBoxPolymiddlewareFromLegacy;

export { legacySendBoxBridgeComponentPropsSchema, type LegacySendBoxBridgeComponentProps };
