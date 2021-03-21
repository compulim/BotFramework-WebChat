import { fromWho, hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AbsoluteTime from './AbsoluteTime';
import RelativeTime from './RelativeTime';
import useStyleSet from '../../hooks/useStyleSet';

const { useStyleOptions } = hooks;

const Timestamp = ({ activity, className }) => {
  const [{ timestamp: timestampStyleSet, sendStatus: sendStatusStyleSet }] = useStyleSet();
  const [{ timestampFormat }] = useStyleOptions();
  const { channelData: { 'webchat:read-by': readBy } = {}, timestamp } = activity;
  const who = fromWho(activity);

  timestampStyleSet &&
    console.warn(
      'botframework-webchat: "styleSet.timestamp" is deprecated. Please use "styleSet.sendStatus". This deprecation migration will be removed on or after December 31, 2021.'
    );

  const shouldShowReadReceipt = who === 'self';

  return (
    !!timestamp && (
      <span
        className={classNames(
          'webchat__activity-status',
          (timestampStyleSet || '') + '',
          (sendStatusStyleSet || '') + '',
          (className || '') + ''
        )}
      >
        {timestampFormat === 'relative' ? <RelativeTime value={timestamp} /> : <AbsoluteTime value={timestamp} />}
        {/* TODO: Better icon and accessibility */}
        {shouldShowReadReceipt && readBy && (
          <span className="webchat__activity-status__read-receipt">{readBy === 'all' ? '✔️' : '⚡'}</span>
        )}
      </span>
    )
  );
};

Timestamp.defaultProps = {
  className: ''
};

Timestamp.propTypes = {
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      'webchat:read-at': PropTypes.any,
      'webchat:who': PropTypes.oneOf(['channel', 'others', 'self'])
    }),
    from: PropTypes.shape({
      role: PropTypes.oneOf(['bot', 'channel', 'user'])
    }),
    timestamp: PropTypes.string.isRequired
  }).isRequired,
  className: PropTypes.string
};

export default Timestamp;
