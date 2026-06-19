import { useCallback, useEffect, useState } from "react";
import type { User } from "@blocks/core";
import {
  DexieStorage,
  buildGoogleOAuthStartUrl,
  parseOAuthHash,
  mergeGoogleProviderIntoUser,
  tokensToGoogleProvider,
  getGoogleProvider,
  isGoogleTokenValid,
  ensureValidGoogleTokens,
} from "@blocks/core";

export function useGoogleCalendarAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const db = DexieStorage.getInstance();
    await db.init();
    const u = await db.getUser();
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    void loadUser().finally(() => setIsLoading(false));
  }, [loadUser]);

  const persistUser = useCallback(async (next: User) => {
    const db = DexieStorage.getInstance();
    await db.init();
    await db.setUser(next);
    setUser(next);
  }, []);

  const connectGoogle = useCallback(
    (returnUrl: string) => {
      window.location.href = buildGoogleOAuthStartUrl(returnUrl);
    },
    [],
  );

  const handleOAuthCallback = useCallback(async (): Promise<boolean> => {
    const parsed = parseOAuthHash(window.location.hash);
    if (!parsed) return false;

    const db = DexieStorage.getInstance();
    await db.init();
    const existing = await db.getUser();
    const provider = tokensToGoogleProvider(
      {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresAt: parsed.expiresAt,
      },
      existing,
    );
    const next = mergeGoogleProviderIntoUser(existing, provider);
    await persistUser(next);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    return true;
  }, [persistUser]);

  const disconnectGoogle = useCallback(async () => {
    const db = DexieStorage.getInstance();
    await db.init();
    const existing = await db.getUser();
    if (!existing) return;
    const providers = existing.providers.filter((p) => p.provider !== "google");
    await persistUser({ ...existing, providers, updatedAt: new Date() });
    await db.clearCalendarCache();
  }, [persistUser]);

  const getValidTokens = useCallback(async () => {
    const u = user ?? (await loadUser());
    return ensureValidGoogleTokens(u, persistUser);
  }, [user, loadUser, persistUser]);

  const isConnected =
    !!user && isGoogleTokenValid(user) || !!getGoogleProvider(user)?.refreshToken;

  return {
    user,
    isLoading,
    error,
    setError,
    isConnected,
    connectGoogle,
    handleOAuthCallback,
    disconnectGoogle,
    getValidTokens,
    reloadUser: loadUser,
  };
}
