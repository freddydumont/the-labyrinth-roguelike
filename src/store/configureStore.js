import * as redux from 'redux';
import { reducer } from '../reducers';
import thunk from 'redux-thunk';
import { createStore } from 'redux';

export default function configureStore(initialState = {}) {
  const store = createStore(
    reducer,
    initialState,
    redux.compose(
      redux.applyMiddleware(thunk),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );
  return store;
}
