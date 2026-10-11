import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const initialState = {};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: process.env.NODE_ENV !== 'production'
});

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  window.__store__ = store;
}

export default store;