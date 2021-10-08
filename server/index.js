// server/index.js

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
var cors = require("cors");
const e = require("express");
const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());

app.use(cors());
let db = new sqlite3.Database("./server/stories.db");

app.get("/api/stories", (req, res) => {
  const stories = db.all("SELECT * FROM stories", (err, stories) => {
    res.json({ stories });
  });
});

app.post("/api/stories/:id/votes", (req, res) => {
  const { id } = req.params;
  const { direction } = req.body;

  if (direction == "down") {
    db.run(
      `
      UPDATE stories
      SET score = score-1
      WHERE
      id = ?;`,
      [id]
    );
  } else {
    db.run(
      `
      UPDATE stories
      SET score = score+1
      WHERE
      id = ?;`,
      [id]
    );
  }
});

app.post("/api/stories/", (req, res) => {
  const { title, url } = req.body;
  console.log(title);
  if (title && url) {
    db.run(
      `INSERT INTO stories (title,url)
                VALUES(?,?);
                `,
      [title, url]
    );
  }
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
