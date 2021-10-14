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

db.run(
  `
  CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  updated_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  user_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) {
      console.log("Error with making the Stories Table ");
      console.log(err);
    }
    console.log("Created Stories Table");
  }
);

db.run(
  `
  CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  direction TEXT NOT NULL DEFAULT 'up',
  created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  updated_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  story_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY(story_id) REFERENCES stories(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) {
      console.log("Error with making the Votes Table ");
      console.log(err);
    } else {
      console.log("Created Votes Table");
    }
  }
);

db.run(
  `
  CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_encrypted TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (DATETIME('now')),
  updated_at DATETIME NOT NULL DEFAULT (DATETIME('now'))
  )`,
  (err) => {
    if (err) {
      console.log("Error with making the Users Table ");
      console.log(err);
    }
    console.log("Created Users Table");
  }
);

db.run(
  `
  CREATE TABLE sessions (
  uuid TEXT PRIMARY KEY,
  created_at DATETIME NOT NULL,
  user_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`,
  (err) => {
    if (err) {
      console.log("Error with making the Sessions Table ");
      console.log(err);
    }
    console.log("Created Sessions Table");
  }
);

db.close();
