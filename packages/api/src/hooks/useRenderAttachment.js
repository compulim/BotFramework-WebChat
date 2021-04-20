import useAPIContext from './internal/useAPIContext';

export default function useRenderAttachment() {
  const { attachmentRenderer } = useAPIContext();

  return attachmentRenderer;
}
