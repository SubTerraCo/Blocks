"use client";

import { useEffect, useState } from "react";
import { getGoogleProvider } from "@blocks/core";
import { useGoogleCalendarAuth } from "./use-google-calendar-auth";

export interface ProfileIdentity {
  name: string;
  email: string;
  avatarUrl?: string;
  isGuest: boolean;
  isLoading: boolean;
}

/** Profile + Google Calendar OAuth (N-0022). Handles OAuth hash callback on mount. */
export function useProfileGoogleAuth() {
  const auth = useGoogleCalendarAuth();
  const [pendingOAuth, setPendingOAuth] = useState(false);
  const { handleOAuthCallback, reloadUser } = auth;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash.includes("access_token")) return;
    setPendingOAuth(true);
    void handleOAuthCallback()
      .finally(() => {
        setPendingOAuth(false);
        void reloadUser();
      });
  }, [handleOAuthCallback, reloadUser]);

  const identity: ProfileIdentity = (() => {
    if (auth.isLoading || pendingOAuth) {
      return {
        name: "Loading…",
        email: "",
        isGuest: true,
        isLoading: true,
      };
    }
    if (auth.isConnected && auth.user) {
      return {
        name: auth.user.name,
        email: auth.user.email,
        avatarUrl: auth.user.avatarUrl,
        isGuest: false,
        isLoading: false,
      };
    }
    return {
      name: "Guest User",
      email: "Connect Google to sync calendar",
      isGuest: true,
      isLoading: false,
    };
  })();

  const hasCalendarAccess = !!getGoogleProvider(auth.user);

  return {
    ...auth,
    pendingOAuth,
    identity,
    hasCalendarAccess,
  };
}
