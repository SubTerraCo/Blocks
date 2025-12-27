import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, dialog } from "electron";
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

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// =============================================================================
// Auto-Updater Configuration
// =============================================================================
function setupAutoUpdater() {
  if (isDev) {
    log.info("Running in development mode - auto-updater disabled");
    return;
  }

  // Configure auto-updater
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates on startup
  autoUpdater.checkForUpdatesAndNotify();

  // Check for updates every hour
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60 * 60 * 1000);

  // Update events
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    sendUpdateStatus("checking");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    sendUpdateStatus("available", info);
    
    dialog.showMessageBox(mainWindow!, {
      type: "info",
      title: "Update Available",
      message: `A new version (${info.version}) is available!`,
      detail: "Downloading now. You'll be notified when it's ready to install.",
      buttons: ["OK"],
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info.version);
    sendUpdateStatus("not-available", info);
  });

  autoUpdater.on("error", (err) => {
    log.error("Update error:", err);
    sendUpdateStatus("error", { message: err.message });
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
    sendUpdateStatus("downloaded", info);
    
    dialog
      .showMessageBox(mainWindow!, {
        type: "info",
        title: "Update Ready",
        message: `Version ${info.version} has been downloaded.`,
        detail: "Would you like to restart now to apply the update?",
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
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
  // Create a simple tray icon (you can replace with actual icon)
  const iconPath = path.join(__dirname, "../../resources/icon.png");
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Create a simple colored icon if file doesn't exist
      trayIcon = nativeImage.createEmpty();
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Blocks",
      click: () => {
        mainWindow?.show();
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
      click: () => {
        if (!isDev) {
          autoUpdater.checkForUpdatesAndNotify();
        } else {
          dialog.showMessageBox({
            type: "info",
            title: "Development Mode",
            message: "Auto-updates are disabled in development mode.",
          });
        }
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
      return { available: false, message: "Updates disabled in dev mode" };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      return { 
        available: result?.updateInfo?.version !== app.getVersion(),
        version: result?.updateInfo?.version 
      };
    } catch (error) {
      return { available: false, error: (error as Error).message };
    }
  });

  ipcMain.handle("app:installUpdate", () => {
    if (updateDownloaded) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  ipcMain.handle("app:getUpdateStatus", () => {
    return { updateDownloaded };
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
});

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
