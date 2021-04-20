import useAPIContext from './internal/useAPIContext';

export default function useRenderToast() {
  return useAPIContext().toastRenderer;
}
