"use client";

import { Loader2, Unlink } from "lucide-react";
import { cn } from "../lib/utils";
import type { useProfileGoogleAuth } from "../hooks/use-profile-google-auth";

type ProfileGoogleAuth = ReturnType<typeof useProfileGoogleAuth>;

export interface ProfileGoogleAccountProps {
  auth: ProfileGoogleAuth;
  oauthReturnUrl: string;
  /** Desktop Electron OAuth; web uses redirect via oauthReturnUrl */
  onConnect?: () => void;
  /** Desktop IPC connect in flight */
  connecting?: boolean;
  connectError?: string | null;
  className?: string;
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function ProfileGoogleAccount({
  auth,
  oauthReturnUrl,
  onConnect,
  connecting = false,
  connectError = null,
  className,
}: ProfileGoogleAccountProps) {
  const {
    isConnected,
    isLoading,
    pendingOAuth,
    connectGoogle,
    disconnectGoogle,
    identity,
  } = auth;

  const busy = isLoading || pendingOAuth || connecting;

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
      return;
    }
    connectGoogle(oauthReturnUrl);
  };

  const statusLine = busy
    ? "Connecting…"
    : isConnected
      ? "Calendar read access granted"
      : "Sign in to show Google Calendar on your timeline";

  return (
    <div className={cn("space-y-2", className)} data-testid="profile-google-account">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Linked Accounts
      </h2>
      <div className="rounded-lg bg-bg-secondary">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
              <GoogleLogo className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-text-primary">Google</p>
              <p className="text-xs text-text-muted truncate" data-testid="profile-google-status">
                {statusLine}
              </p>
            </div>
          </div>
          {busy ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-muted" />
          ) : isConnected ? (
            <button
              type="button"
              data-testid="profile-google-disconnect"
              onClick={() => void disconnectGoogle()}
              className="flex shrink-0 items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
            >
              <Unlink className="h-4 w-4" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              data-testid="profile-google-connect"
              onClick={handleConnect}
              className="shrink-0 text-sm font-medium text-accent-magenta hover:text-accent-magenta/80"
            >
              Connect
            </button>
          )}
        </div>
        {!isConnected && !busy && (
          <p
            className="border-t border-border-default px-4 py-2 text-xs text-text-muted"
            data-testid="profile-google-scopes"
          >
            Requests read-only access to Google Calendar and your email.
          </p>
        )}
        {isConnected && identity.email && (
          <p
            className="border-t border-border-default px-4 py-2 text-xs text-text-secondary truncate"
            data-testid="profile-google-email"
          >
            {identity.email}
          </p>
        )}
        {connectError && (
          <p
            className="border-t border-border-default px-4 py-2 text-xs text-red-400 whitespace-pre-wrap"
            data-testid="profile-google-connect-error"
          >
            {connectError}
          </p>
        )}
      </div>
    </div>
  );
}

export interface ProfileIdentityHeaderProps {
  identity: ProfileGoogleAuth["identity"];
  className?: string;
}

export function ProfileIdentityHeader({ identity, className }: ProfileIdentityHeaderProps) {
  const initial = identity.name.charAt(0).toUpperCase();

  return (
    <div
      className={cn("mb-6 flex items-center gap-4", className)}
      data-testid="profile-identity-header"
    >
      {identity.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={identity.avatarUrl}
          alt=""
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-magenta text-3xl font-bold text-white">
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-text-primary truncate" data-testid="profile-user-name">
          {identity.name}
        </h1>
        <p className="text-sm text-text-secondary truncate" data-testid="profile-user-email">
          {identity.email}
        </p>
      </div>
    </div>
  );
}
