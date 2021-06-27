import { AttachmentForScreenReaderMiddleware, AttachmentMiddleware } from 'botframework-webchat-api';
import { useMemo } from 'react';

import createAdaptiveAppletFrameworkAttachmentMiddleware from './adaptiveAppletFramework/createAttachmentMiddleware';
import createAdaptiveAppletFrameworkStyleSet from './adaptiveAppletFramework/styles/createAdaptiveAppletFrameworkStyleSet';
import createAdaptiveCardsAttachmentForScreenReaderMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './renderMarkdown';
import FullBundleStyleOptions from './types/FullBundleStyleOptions';

export default function useComposerProps({
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  renderMarkdown,
  styleOptions,
  styleSet
}: {
  attachmentForScreenReaderMiddleware: AttachmentForScreenReaderMiddleware[];
  attachmentMiddleware: AttachmentMiddleware[];
  renderMarkdown?: (markdown: string, { markdownRespectCRLF: boolean }, { externalLinkAlt: string }) => string;
  styleOptions: FullBundleStyleOptions;
  styleSet: any;
}): {
  attachmentForScreenReaderMiddleware: AttachmentForScreenReaderMiddleware[];
  attachmentMiddleware: AttachmentMiddleware[];
  renderMarkdown: (markdown: string, { markdownRespectCRLF: boolean }, { externalLinkAlt: string }) => string;
  extraStyleSet: any;
} {
  const patchedAttachmentMiddleware = useMemo(
    () => [
      ...attachmentMiddleware,
      createAdaptiveAppletFrameworkAttachmentMiddleware(),
      createAdaptiveCardsAttachmentMiddleware()
    ],
    [attachmentMiddleware]
  );

  const patchedAttachmentForScreenReaderMiddleware = useMemo(
    () => [...attachmentForScreenReaderMiddleware, createAdaptiveCardsAttachmentForScreenReaderMiddleware()],
    [attachmentForScreenReaderMiddleware]
  );

  // When styleSet is not specified, the styleOptions will be used to create Adaptive Cards styleSet and merged into useStyleSet.
  const extraStyleSet = useMemo(
    () =>
      styleSet
        ? undefined
        : { ...createAdaptiveCardsStyleSet(styleOptions), ...createAdaptiveAppletFrameworkStyleSet() },
    [styleOptions, styleSet]
  );

  const patchedRenderMarkdown = useMemo(
    () => (typeof renderMarkdown === 'undefined' ? defaultRenderMarkdown : renderMarkdown),
    [renderMarkdown]
  );

  return {
    attachmentForScreenReaderMiddleware: patchedAttachmentForScreenReaderMiddleware,
    attachmentMiddleware: patchedAttachmentMiddleware,
    extraStyleSet,
    renderMarkdown: patchedRenderMarkdown
  };
}
