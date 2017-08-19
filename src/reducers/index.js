import { combineReducers } from 'redux';
import { authReducer } from './auth';

export const reducer = combineReducers({
  auth: authReducer
});
