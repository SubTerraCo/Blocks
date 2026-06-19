"use client";

import {
  DexieStorage,
  DexieYjsBridge,
  mergeGoogleProviderIntoUser,
  tokensToGoogleProvider,
} from "@blocks/core";

declare global {
  interface Window {
    blocksPlaywright?: {
      getDb: () => ReturnType<typeof DexieStorage.getInstance>;
      mergeGoogleProviderIntoUser: typeof mergeGoogleProviderIntoUser;
      tokensToGoogleProvider: typeof tokensToGoogleProvider;
      DexieYjsBridge: typeof DexieYjsBridge;
    };
  }
}

if (
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
) {
  window.blocksPlaywright = {
    getDb: () => DexieStorage.getInstance(),
    mergeGoogleProviderIntoUser,
    tokensToGoogleProvider,
    DexieYjsBridge,
  };
}

export function PlaywrightSeed() {
  return null;
}
