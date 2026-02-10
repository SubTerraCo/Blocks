import { useState, useEffect, useCallback } from "react";
import { Download, X, RefreshCw, Check } from "lucide-react";

type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloaded"
  | "error"
  | "dismissed";

interface UpdateState {
  status: UpdateStatus;
  version?: string;
  downloadProgress?: number;
  error?: string;
}

/**
 * Subtle update notification component that appears above the navigation bar
 * Similar to Cursor's update dialog - allows users to choose when to update
 */
export function UpdateNotification() {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: "idle" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in Electron environment
    if (typeof window === "undefined" || !window.electronAPI) return;

    // Listen for update status changes from main process
    const unsubscribe = window.electronAPI.onUpdateStatus((event) => {
      switch (event.status) {
        case "checking":
          setUpdateState({ status: "checking" });
          break;
        case "available":
          setUpdateState({
            status: "available",
            version: event.data?.version,
          });
          setIsVisible(true);
          break;
        case "not-available":
          setUpdateState({ status: "idle" });
          setIsVisible(false);
          break;
        case "downloading":
          setUpdateState({
            status: "downloading",
            version: updateState.version,
            downloadProgress: event.data?.percent,
          });
          setIsVisible(true);
          break;
        case "downloaded":
          setUpdateState({
            status: "downloaded",
            version: event.data?.version || updateState.version,
          });
          setIsVisible(true);
          break;
        case "error":
          setUpdateState({
            status: "error",
            error: event.data?.message,
          });
          // Show error briefly then hide
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), 5000);
          break;
        case "dismissed":
          setUpdateState({ status: "dismissed" });
          setIsVisible(false);
          break;
        default:
          break;
      }
    });

    // Check current update status on mount
    window.electronAPI.getUpdateStatus().then((status) => {
      if (status.availableVersion) {
        setUpdateState({
          status: status.updateDownloaded ? "downloaded" : "available",
          version: status.availableVersion,
        });
        setIsVisible(true);
      }
    });

    return () => unsubscribe();
  }, [updateState.version]);

  const handleInstall = useCallback(async () => {
    if (!window.electronAPI) return;

    if (updateState.status === "available") {
      // Start downloading
      await window.electronAPI.downloadUpdate();
    } else if (updateState.status === "downloaded") {
      // Install and restart
      await window.electronAPI.installUpdate();
    }
  }, [updateState.status]);

  const handleDismiss = useCallback(async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.dismissUpdate();
    setIsVisible(false);
    setUpdateState({ status: "dismissed" });
  }, []);

  // Don't render if not visible or not in Electron
  if (!isVisible || typeof window === "undefined" || !window.electronAPI) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 left-4 z-50 animate-in slide-in-from-left-4 fade-in duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-secondary px-4 py-3 shadow-lg backdrop-blur-sm">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {updateState.status === "checking" && (
            <RefreshCw className="h-4 w-4 animate-spin text-text-secondary" />
          )}
          {updateState.status === "available" && (
            <Download className="h-4 w-4 text-accent-cyan" />
          )}
          {updateState.status === "downloading" && (
            <RefreshCw className="h-4 w-4 animate-spin text-accent-cyan" />
          )}
          {updateState.status === "downloaded" && (
            <Check className="h-4 w-4 text-accent-green" />
          )}
          {updateState.status === "error" && (
            <X className="h-4 w-4 text-accent-magenta" />
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-primary">
            {updateState.status === "checking" && "Checking for updates..."}
            {updateState.status === "available" &&
              `New update: v${updateState.version}`}
            {updateState.status === "downloading" && (
              <>
                Downloading...{" "}
                {updateState.downloadProgress !== undefined &&
                  `${Math.round(updateState.downloadProgress)}%`}
              </>
            )}
            {updateState.status === "downloaded" && "Update ready to install"}
            {updateState.status === "error" && "Update failed"}
          </span>
          {updateState.status === "error" && updateState.error && (
            <span className="text-xs text-text-secondary">{updateState.error}</span>
          )}
        </div>

        {/* Actions */}
        <div className="ml-2 flex items-center gap-2">
          {(updateState.status === "available" ||
            updateState.status === "downloaded") && (
            <button
              onClick={handleInstall}
              className="rounded-md bg-accent-cyan px-3 py-1.5 text-xs font-medium text-bg-primary transition-colors hover:bg-accent-cyan/90"
            >
              {updateState.status === "available" ? "Install" : "Restart"}
            </button>
          )}

          {updateState.status !== "downloading" &&
            updateState.status !== "checking" && (
              <button
                onClick={handleDismiss}
                className="rounded-md px-2 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                aria-label="Dismiss update notification"
              >
                Later
              </button>
            )}
        </div>

        {/* Close button for errors */}
        {updateState.status === "error" && (
          <button
            onClick={handleDismiss}
            className="ml-1 rounded p-1 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            aria-label="Close notification"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

