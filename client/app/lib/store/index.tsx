import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'reduxjs-toolkit-persist';
import storage from 'reduxjs-toolkit-persist/lib/storage';
import persistStore from 'reduxjs-toolkit-persist/es/persistStore';
import {
  FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE
} from 'reduxjs-toolkit-persist/es/constants';
import authSlice from '@/app/lib/store/authSlice';

const persistConfig = {
  key: 'openevals',
  storage,
  whitelist: [],
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    auth: authSlice,
  })
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: []
      },
    }),
});

const persistedStore = persistStore(store);

export { store, persistedStore };
export type IRootState = ReturnType<typeof persistedReducer>;
