import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, dialog, globalShortcut, powerMonitor } from "electron";
import path from "path";
import log from "electron-log";
import { autoUpdater } from "electron-updater";

// Configure logging
log.transports.file.level = "info";
autoUpdater.logger = log;
log.info("App starting...");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// This is only needed for NSIS installer
try {
  if (require.resolve("electron-squirrel-startup")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (require("electron-squirrel-startup")) {
      app.quit();
    }
  }
} catch {
  // Module not installed - running in dev mode or without installer
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAppQuitting = false;
let updateDownloaded = false;

/** @deprecated N-0003 rolling timeline — midnight auto-clear disabled */
function scheduleMidnightTimelineClear() {
  // no-op
}

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

/** NSIS / updater passes these when replacing or removing an installed build */
const INSTALLER_SHUTDOWN_FLAGS = [
  "--updated",
  "--install",
  "--uninstall",
  "--squirrel-uninstall",
  "--squirrel-updated",
  "--squirrel-obsolete",
];

if (INSTALLER_SHUTDOWN_FLAGS.some((flag) => process.argv.includes(flag))) {
  log.info("Installer shutdown flag detected — exiting for upgrade/uninstall");
  app.quit();
}

// =============================================================================
// Auto-Updater Configuration
// =============================================================================

// Store for tracking update check timing
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
let lastUpdateCheck: number = 0;
let availableUpdateVersion: string | null = null;

// Check internet connectivity
async function isOnline(): Promise<boolean> {
  try {
    const { net } = await import("electron");
    return net.isOnline();
  } catch {
    return false;
  }
}

// Check if we should check for updates (24h cooldown)
function shouldCheckForUpdates(): boolean {
  const now = Date.now();
  if (now - lastUpdateCheck > UPDATE_CHECK_INTERVAL) {
    return true;
  }
  return false;
}

// Check for updates only when online and cooldown passed
async function checkForUpdatesIfOnline(force: boolean = false) {
  if (!force && !shouldCheckForUpdates()) {
    log.info("Update check skipped - checked within last 24 hours");
    return;
  }
  
  const online = await isOnline();
  if (online) {
    log.info("Internet connected - checking for updates...");
    lastUpdateCheck = Date.now();
    autoUpdater.checkForUpdates();
  } else {
    log.info("No internet connection - skipping update check");
    sendUpdateStatus("offline");
  }
}

function setupAutoUpdater() {
  if (isDev) {
    log.info("Running in development mode - auto-updater disabled");
    return;
  }

  // Configure auto-updater - USER CHOICE, no auto-download
  autoUpdater.autoDownload = false;  // User must choose to download
  autoUpdater.autoInstallOnAppQuit = false;  // User must choose to install
  
  // Set update feed URL to GitHub releases
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "PoweredUpLabs",
    repo: "Blocks",
  });

  // Check for updates on startup (after a short delay)
  setTimeout(() => {
    checkForUpdatesIfOnline();
  }, 5000);

  // NO hourly checks - only on startup or manual trigger

  // Update events
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    sendUpdateStatus("checking");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    availableUpdateVersion = info.version;
    // Send to renderer for in-app notification (no dialog popup)
    sendUpdateStatus("available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("App is up to date:", info.version);
    sendUpdateStatus("not-available", { version: info.version });
  });

  autoUpdater.on("error", (err) => {
    // Handle common errors gracefully without alarming users
    const errorMessage = err.message || String(err);
    
    // 404 = No releases published yet or private repo without token
    // ENOTFOUND = No internet
    // These are expected during early development
    if (errorMessage.includes("404") || errorMessage.includes("ENOTFOUND")) {
      log.info("Update check skipped - no releases available yet or repo is private");
      sendUpdateStatus("not-available", { version: app.getVersion() });
      return;
    }
    
    // Only log actual errors
    log.error("Update error:", err);
    // Don't show error to user for update issues - just silently fail
    sendUpdateStatus("not-available", { version: app.getVersion() });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    log.info(`Download progress: ${progressObj.percent.toFixed(1)}%`);
    sendUpdateStatus("downloading", {
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info.version);
    updateDownloaded = true;
    // Notify renderer - user can install when ready
    sendUpdateStatus("downloaded", { version: info.version });
  });
}

function sendUpdateStatus(status: string, data?: unknown) {
  mainWindow?.webContents.send("update-status", { status, data });
}

// =============================================================================
// Window Creation
// =============================================================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#0D0D0D",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0D0D0D",
      symbolColor: "#FFFFFF",
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, "../../resources/icon.png"),
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Minimize to tray instead of closing
  mainWindow.on("close", (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

// =============================================================================
// System Tray
// =============================================================================
function createTray() {
  const iconPath = path.join(__dirname, "../../resources/icon.png");
  let trayIcon = nativeImage.createFromPath(iconPath);

  if (trayIcon.isEmpty()) {
    // 16x16 magenta hex fallback when icon asset missing
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      buffer[i * 4] = 236;     // R
      buffer[i * 4 + 1] = 72;  // G
      buffer[i * 4 + 2] = 153; // B
      buffer[i * 4 + 3] = 255; // A
    }
    trayIcon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
  }

  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Blocks",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: "Timeline",
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("navigate", "/timeline");
      },
    },
    {
      label: "Quick Add Task",
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("navigate", "/add-task");
      },
    },
    { type: "separator" },
    {
      label: "Check for Updates",
      click: async () => {
        if (isDev) {
          dialog.showMessageBox({
            type: "info",
            title: "Development Mode",
            message: "Auto-updates are disabled in development mode.",
          });
          return;
        }
        
        const online = await isOnline();
        if (!online) {
          dialog.showMessageBox({
            type: "warning",
            title: "No Internet Connection",
            message: "Please connect to the internet to check for updates.",
          });
          return;
        }
        
        // Force check bypasses 24h cooldown
        checkForUpdatesIfOnline(true);
      },
    },
    { type: "separator" },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    {
      label: "Quit",
      click: () => {
        isAppQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(`Blocks v${app.getVersion()}`);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow?.show();
  });
}

// =============================================================================
// IPC Handlers
// =============================================================================
function setupIpcHandlers() {
  // Window controls
  ipcMain.handle("window:minimize", () => {
    mainWindow?.minimize();
  });

  ipcMain.handle("window:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle("window:close", () => {
    mainWindow?.close();
  });

  ipcMain.handle("window:isMaximized", () => {
    return mainWindow?.isMaximized() ?? false;
  });

  // App info
  ipcMain.handle("app:getVersion", () => {
    return app.getVersion();
  });

  ipcMain.handle("app:getPlatform", () => {
    return process.platform;
  });

  // Update controls
  ipcMain.handle("app:checkForUpdates", async () => {
    if (isDev) {
      return { available: false, message: "Updates disabled in dev mode", online: true };
    }
    
    // Check internet connectivity first
    const online = await isOnline();
    if (!online) {
      return { available: false, message: "No internet connection", online: false };
    }
    
    try {
      const result = await autoUpdater.checkForUpdates();
      return { 
        available: result?.updateInfo?.version !== app.getVersion(),
        version: result?.updateInfo?.version,
        currentVersion: app.getVersion(),
        online: true
      };
    } catch (error) {
      return { available: false, error: (error as Error).message, online: true };
    }
  });
  
  // Check if online
  ipcMain.handle("app:isOnline", async () => {
    return await isOnline();
  });

  // Download the update (user-initiated)
  ipcMain.handle("app:downloadUpdate", async () => {
    if (availableUpdateVersion) {
      log.info("User initiated download for version:", availableUpdateVersion);
      await autoUpdater.downloadUpdate();
      return { success: true };
    }
    return { success: false, message: "No update available to download" };
  });

  // Dismiss the update notification (user chose "Later")
  ipcMain.handle("app:dismissUpdate", () => {
    availableUpdateVersion = null;
    sendUpdateStatus("dismissed");
    return { success: true };
  });

  ipcMain.handle("app:installUpdate", () => {
    if (updateDownloaded) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  ipcMain.handle("app:getUpdateStatus", () => {
    return { 
      updateDownloaded,
      availableVersion: availableUpdateVersion,
      currentVersion: app.getVersion(),
    };
  });

  // Force check for updates (bypasses 24h cooldown)
  ipcMain.handle("app:forceCheckUpdates", async () => {
    await checkForUpdatesIfOnline(true);
    return { success: true };
  });

  ipcMain.handle("app:showWindow", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
    return { success: true };
  });
}

// =============================================================================
// App Lifecycle
// =============================================================================
app.whenReady().then(() => {
  log.info(`Blocks v${app.getVersion()} starting...`);
  
  setupIpcHandlers();
  createWindow();
  createTray();
  setupAutoUpdater();
  scheduleMidnightTimelineClear();

  // Global shortcut: Ctrl+Shift+B to focus Blocks
  globalShortcut.register("CommandOrControl+Shift+B", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isAppQuitting = true;
  globalShortcut.unregisterAll();
});

// OS shutdown must fully exit (not hide to tray). Installer upgrades use taskkill via installer.nsh.
if (process.platform === "win32") {
  powerMonitor.on("shutdown", () => {
    log.info("System shutdown — quitting Blocks");
    isAppQuitting = true;
    tray?.destroy();
    mainWindow?.destroy();
  });
}

// Handle second instance - focus existing window
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
