import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo } from 'react';

import { legacySendBoxBridgeComponentPropsSchema, type LegacySendBoxBridgeComponentProps } from './createSendBoxPolymiddlewareFromLegacy';

/**
 * This component is solely for `createSendBoxPolymiddlewareFromLegacy`.
 *
 * @param props Legacy sendBox middleware props, includes `className` and `render`.
 * @returns A sendBox node rendered using the `props.render` component.
 */
function LegacySendBoxBridge(props: LegacySendBoxBridgeComponentProps) {
  const { className, render: RenderComponent } = validateProps(legacySendBoxBridgeComponentPropsSchema, props);

  return (
    <Fragment>
      <RenderComponent className={className} />
    </Fragment>
  );
}

export default memo(LegacySendBoxBridge);
