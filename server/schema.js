const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const path = "./stories.db";

try {
  fs.unlinkSync(path);
  //file removed
} catch (err) {
  console.error("Making database");
}

let db = new sqlite3.Database(path, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQlite database.");
});

db.run(`
  CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  updated_at DATETIME NOT NULL DEFAULT (DATETIME('now'))
  )`);
console.log("Created Stories Table");

db.run(`
  CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  direction TEXT NOT NULL DEFAULT 'up',
  created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  updated_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  story_id INTEGER,
  FOREIGN KEY(story_id) REFERENCES stories(id)
  )`);
console.log("Created Votes Table");

db.close();
