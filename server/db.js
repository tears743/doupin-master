import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite3Verbose = sqlite3.verbose();

// Determine DB Path
let dbPath = process.env.DB_PATH;

if (!dbPath) {
  const isDev = process.env.ELECTRON_IS_DEV === "1";
  if (!isDev && app) {
    // In production, use userData
    try {
      dbPath = path.join(app.getPath("userData"), "works.db");
    } catch (e) {
      dbPath = path.resolve(__dirname, "works.db");
    }
  } else {
    // In development, use the project root's server directory
    // This file is in server/db.js, so works.db will be in server/works.db
    dbPath = path.resolve(__dirname, "works.db");
  }
}

console.log(`Database path: ${dbPath}`);

const db = new sqlite3Verbose.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      width INTEGER,
      height INTEGER,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
      (err) => {
        if (err) {
          console.error("Error creating table", err.message);
        }
      },
    );
  }
});

export default db;
