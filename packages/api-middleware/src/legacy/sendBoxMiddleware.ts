import { type ComponentEnhancer } from 'react-chain-of-responsibility';
import { type ComponentType, type ReactNode } from 'react';

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxProps = {
  readonly className?: string | undefined;
};

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxRenderer = () => ReactNode;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxComponentFactory = ComponentType<LegacySendBoxProps>;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxMiddleware = () => ComponentEnhancer<void, LegacySendBoxProps, LegacySendBoxRenderer>;

export {
  type LegacySendBoxComponentFactory,
  type LegacySendBoxMiddleware,
  type LegacySendBoxProps,
  type LegacySendBoxRenderer
};
