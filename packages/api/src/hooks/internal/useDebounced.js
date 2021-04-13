// import { useEffect, useMemo, useRef } from 'react';
// import AbortController from 'abort-controller-es5';

// import useForceRender from './useForceRender';

// export default function useDebounced(value, debounceInterval) {
//   const abortController = useMemo(() => new AbortController(), []);
//   const lastUpdateRef = useRef(0);
//   const forceRender = useForceRender();
//   const prevValueRef = useRef();
//   const renderTimeoutRef = useRef();

//   useEffect(() => () => abortController.abort(), [abortController]);

//   if (value !== prevValueRef.current) {
//     const now = Date.now();
//     const { current: lastUpdate } = lastUpdateRef;

//     if (now - lastUpdate >= debounceInterval) {
//       lastUpdateRef.current = now;
//       prevValueRef.current = value;
//     } else if (!renderTimeoutRef.current) {
//       renderTimeoutRef.current = setTimeout(() => {
//         if (!abortController.signal.aborted) {
//           renderTimeoutRef.current = null;
//           forceRender();
//         }
//       }, debounceInterval - now + lastUpdate);
//     }
//   }

//   return prevValueRef.current;
// }
