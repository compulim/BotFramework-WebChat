import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo, useMemo } from 'react';

import { legacySendBoxBridgeComponentPropsSchema, type LegacySendBoxBridgeComponentProps } from './createSendBoxPolymiddlewareFromLegacy';

/**
 * This component is solely for `createSendBoxPolymiddlewareFromLegacy`.
 *
 * @param props Legacy sendBox middleware props, includes `className` and `render`.
 * @returns A sendBox node rendered using the `props.render()` of type `LegacySendBoxRenderFunction`.
 */
function LegacySendBoxBridge(props: LegacySendBoxBridgeComponentProps) {
  const { className, render } = validateProps(legacySendBoxBridgeComponentPropsSchema, props);

  const children = useMemo(() => render(), [render]);

  // Pass className to the rendered component if needed
  // For now, just render the children as-is since the legacy middleware handles className internally
  return <Fragment>{children}</Fragment>;
}

export default memo(LegacySendBoxBridge);
