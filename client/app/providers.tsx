"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { store, persistedStore } from "@/app/lib/store";
import { PersistGate } from "reduxjs-toolkit-persist/integration/react";
import { Provider } from "react-redux";
import { ModelStorageProvider } from "./lib/providers/model-storage";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <Provider store={store}>
        <ModelStorageProvider>
          <PersistGate loading={null} persistor={persistedStore}>
            {children}
          </PersistGate>
        </ModelStorageProvider>
      </Provider>
    </ChakraProvider>
  );
}
