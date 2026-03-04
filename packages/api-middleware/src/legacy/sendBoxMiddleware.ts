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
type LegacySendBoxComponent = (props: LegacySendBoxProps) => Exclude<ReactNode, boolean | null | undefined>;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxRenderer = () => LegacySendBoxComponent;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxComponentFactory = ComponentType<LegacySendBoxProps>;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxEnhancer = (next: LegacySendBoxRenderer) => LegacySendBoxRenderer;

/**
 * @deprecated Legacy sendBox middleware is being deprecated and will be removed on or after 2027-08-16.
 */
type LegacySendBoxMiddleware = () => LegacySendBoxEnhancer;

export {
  type LegacySendBoxComponentFactory,
  type LegacySendBoxMiddleware,
  type LegacySendBoxProps,
  type LegacySendBoxRenderer
};
