import useAPIContext from './internal/useAPIContext';

export default function useCreateAttachmentForScreenReaderRenderer() {
  return useAPIContext().attachmentForScreenReaderRenderer;
}
