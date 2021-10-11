// server/index.js

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());

app.use(cors());
let db = new sqlite3.Database("./server/stories.db");

app.get("/api/stories", async (req, res) => {
  db.all(
    `SELECT stories.*,
    MAX(0, SUM(CASE direction WHEN 'up' THEN 1 ELSE -1 END)) AS score
    FROM stories
    LEFT JOIN votes ON votes.story_id = stories.id
    GROUP BY stories.id;`,
    (err, stories) => {
      if (err) {
        console.log(err);
      }
      console.log(stories);
      res.json({ stories });
    }
  );
});

app.post("/api/stories/:id/votes", (req, res) => {
  const { id } = req.params;
  const { direction } = req.body;

  db.run(
    `
      INSERT INTO votes(direction,story_id) 
      VALUES(?,?);
      `,
    [direction, id]
  );
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

// Have Node serve the files for built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

// All other GET requests not handled before will return the React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
