import { app, BrowserWindow, session } from "electron";
import {
  checkDirectories,
  isDev,
  getPreloadPath,
  getUIPath,
} from "./helpers/index.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";
import { ipcMainEvents } from "./ipcEvents/index.js";
import { closeServer, startServer } from "./index.js";
import { closeAllWindows } from "./hudWindow.js";

let mainWindow: BrowserWindow;

app.on("ready", () => {
  mainWindow = createMainWindow();
  createMenu(mainWindow);
  checkDirectories();
  startServer();
  createTray();
  ipcMainEvents(mainWindow);

  // Set up media permissions for webcam
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    // Allow media (camera/microphone) permissions
    if (permission === 'media') {
      callback(true);
    } else {
      callback(true); // Allow other permissions too
    }
  });

  // Also set permission check handler for synchronous permission checks
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    // Allow media permissions for webcam overlay
    if (permission === 'media') {
      return true;
    }
    return true;
  });

  mainWindow.on("close", () => {
    closeAllWindows();
    closeServer();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 800,
    height: 700,
    minHeight: 513,
    frame: false,
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  return mainWindow;
}

