'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { store, persistedStore } from '@/app/lib/store';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import { Provider } from 'react-redux';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistedStore}>
        {children}
      </PersistGate>
    </Provider>
  </ChakraProvider>
}