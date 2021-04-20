import { useContext } from 'react';

import APIContext from '../../contexts/APIContext';

export default function useAPIContext() {
  const context = useContext(APIContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
