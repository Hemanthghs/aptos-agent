"use client";

import { Provider } from "react-redux";
import { ReactNode } from "react";
import { store } from "@/store/store";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
