import { useContext } from 'react';

import InputContext from '../../contexts/InputContext';

export default function useInputContext() {
  const context = useContext(InputContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
