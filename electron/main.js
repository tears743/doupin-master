/* eslint-disable no-undef */
import { app, BrowserWindow, ipcMain, Menu, nativeImage } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getColors, getAllBrands } from "../server/data/colors.js";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../server/data/tasks.js";
import db from "../server/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.ELECTRON_IS_DEV === "1";
const logPath = path.join(app.getPath("userData"), "main.log");

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

// Remove default menu
Menu.setApplicationMenu(null);

// IPC Handlers
ipcMain.handle("get-brands", () => {
  try {
    return getAllBrands();
  } catch (err) {
    log(`Error in get-brands: ${err.message}`);
    throw err;
  }
});

ipcMain.handle("get-colors", (event, brand, set) => {
  try {
    return getColors(brand, set);
  } catch (err) {
    log(`Error in get-colors: ${err.message}`);
    throw err;
  }
});

// Works Handlers (Promisify SQLite)
ipcMain.handle("get-works", async () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, name, width, height, data, created_at FROM works ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else {
        const parsedRows = rows.map((row) => {
          try {
            row.data = JSON.parse(row.data);
          } catch (e) {
            row.data = [];
          }
          return row;
        });
        resolve(parsedRows);
      }
    });
  });
});

ipcMain.handle("get-work", async (event, id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM works WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else {
        if (row) {
          try {
            row.data = JSON.parse(row.data);
          } catch (e) {
            // ignore
          }
          resolve(row);
        } else {
          reject(new Error("Work not found"));
        }
      }
    });
  });
});

ipcMain.handle("save-work", async (event, work) => {
  const { id, name, width, height, data } = work;
  const dataStr = JSON.stringify(data);

  return new Promise((resolve, reject) => {
    if (id) {
      // Update
      const sql = `UPDATE works SET 
        name = COALESCE(?, name), 
        width = COALESCE(?, width), 
        height = COALESCE(?, height), 
        data = COALESCE(?, data),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`;
      db.run(sql, [name, width, height, dataStr, id], function (err) {
        if (err) reject(err);
        else resolve({ id, changes: this.changes });
      });
    } else {
      // Create
      const sql =
        "INSERT INTO works (name, width, height, data) VALUES (?, ?, ?, ?)";
      db.run(sql, [name, width, height, dataStr], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...work });
      });
    }
  });
});

ipcMain.handle("delete-work", async (event, id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM works WHERE id = ?";
    db.run(sql, id, function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
});

// Tasks Handlers
ipcMain.handle("get-tasks", () => getTasks());
ipcMain.handle("add-task", (event, task) => addTask(task));
ipcMain.handle("update-task", (event, id, updates) => updateTask(id, updates));
ipcMain.handle("delete-task", (event, id) => deleteTask(id));

// Window Control Handlers
ipcMain.handle("window-min", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.minimize();
});

ipcMain.handle("window-max", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.handle("window-close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});

function createWindow() {
  const iconPath = path.join(__dirname, "../public/logo.png");
  const icon = nativeImage.createFromPath(iconPath);

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: icon,
    frame: false, // Frame-less window
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.setIcon(icon);

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the index.html from the dist folder
    // Use hash router in frontend, so we load the index.html
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Add crash listeners
  mainWindow.webContents.on("render-process-gone", (event, details) => {
    log(`Renderer process gone: ${details.reason} (${details.exitCode})`);
    console.error(
      `Renderer process gone: ${details.reason} (${details.exitCode})`,
    );
  });

  mainWindow.webContents.on("unresponsive", () => {
    log("Renderer process unresponsive");
    console.error("Renderer process unresponsive");
  });
}

app.whenReady().then(() => {
  // Set App User Model ID for Windows taskbar icons
  if (process.platform === "win32") {
    app.setAppUserModelId("com.pindou.app");
  }

  createWindow();

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
