import { getMetadata } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React from 'react';

import FileContent from './FileContent';

const FileAttachment = ({ activity, attachment }) => {
  const { attachments = [] } = activity || {};
  const { attachmentSizes = [] } = getMetadata(activity);

  const attachmentIndex = attachments.indexOf(attachment);
  const size = attachmentSizes[attachmentIndex];

  return <FileContent fileName={attachment.name} href={attachment.contentUrl} size={size} />;
};

FileAttachment.propTypes = {
  activity: PropTypes.shape({
    attachment: PropTypes.array
  }).isRequired,
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string,
    name: PropTypes.string.isRequired
  }).isRequired
};

export default FileAttachment;
