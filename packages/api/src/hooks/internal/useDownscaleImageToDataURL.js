import useAPIContext from './useAPIContext';

export default function useDownscaleImageToDataURL() {
  const { downscaleImageToDataURL } = useAPIContext();

  return downscaleImageToDataURL;
}
