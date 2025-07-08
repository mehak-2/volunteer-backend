"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "@/components/ui/toaster";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <Toaster />
      {children}
    </Provider>
  );
}
