import useACSClients from './useACSClients';

export default function useACSUserId(): [string] {
  return [useACSClients().userId];
}
