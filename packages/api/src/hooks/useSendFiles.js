import useInputContext from './internal/useInputContext';

export default function useSendFiles() {
  return useInputContext().sendFiles;
}
