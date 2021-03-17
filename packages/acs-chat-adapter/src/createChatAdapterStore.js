// import { applyMiddleware, createStore } from 'redux';

// import createDebug from '../util/debug';
// import createReducer from './createReducer';
// import styleConsole from '../util/styleConsole';

// let debug;

// export default function createChatAdapterStore({ userId }) {
//   debug || (debug = createDebug('acs:store', { backgroundColor: 'orange' }));

//   return createStore(
//     createReducer({ userId }),
//     applyMiddleware(() => next => action => {
//       debug([`Received action of type %c${action.type}%c`, ...styleConsole('purple')], [action]);

//       return next(action);
//     })
//   );
// }
