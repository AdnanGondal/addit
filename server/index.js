// server/index.js

// named functions
// Backend readability
// group similar functions.
// Middleware:
// Router: Seprate files out

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const getTitleAtUrl = require("get-title-at-url");
const passwordValidator = require("password-validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const e = require("express");

const SALT_ROUNDS = 8;
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

let db = new sqlite3.Database("./server/stories.db");

// For Password
const schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1); // Must have at least 2 digit

// ROUTING ---x

app.get("/api/stories", async (req, res) => {
  db.all(
    `SELECT stories.*,
    MAX(0, SUM(CASE direction WHEN 'up' THEN 1 ELSE -1 END)) AS score
    FROM stories
    LEFT JOIN votes ON votes.story_id = stories.id
    GROUP BY stories.id
    ORDER BY score DESC;`,

    (err, stories) => {
      if (err) {
        console.log(err);
      }
      //console.log(req.cookies.sessionID);
      if (req.cookies.sessionID) {
        res.json({ stories: stories, loggedIn: true });
      } else {
        res.json({ stories: stories, loggedIn: false });
      }
    }
  );
});

function getCurrentUser(sessionID, fn) {
  db.get(
    `
    SELECT id,email FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.uuid = ?
  `,
    [sessionID],
    (err, user) => {
      fn(user.id);
    }
  );
}

app.post("/api/stories/:id/votes", (req, res) => {
  const { id } = req.params;
  const { direction } = req.body;

  const sessionID = req.cookies.sessionID;

  if (!sessionID) {
    res.status(403).json({ message: "Error: You need to log in." });
  } else {
    getCurrentUser(sessionID, (user_id) => {
      console.log(user_id);
      db.run(
        `
        INSERT INTO votes(direction,story_id,user_id)
        VALUES(?,?,?);
        `,
        [direction, id, user_id]
      );
      res.status(200).json({ message: "Logged in user has voted" });
    });
  }
});

app.post("/api/stories/", (req, res) => {
  const { url, title } = req.body;

  const sessionID = req.cookies.sessionID;
  console.log(sessionID);
  if (!sessionID) {
    console.log("here");
    res.status(403).json({ message: "Error: You need to log in." });
  } else {
    if (url && !title) {
      getTitleAtUrl(url, function (title) {
        if (!title) title = "Title Not Found";
        db.run(
          `INSERT INTO stories (title,url)
                            VALUES(?,?);
                            `,
          [title, url]
        );
        res.status(200).json({ status: "success" });
      });
    } else if (url && title) {
      db.run(
        `INSERT INTO stories (title,url)
                          VALUES(?,?);
                          `,
        [title, url]
      );
      res.status(200).json({ status: "success" });
    }
  }
});

app.post("/api/users/", async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  db.all(
    `SELECT email FROM users
    WHERE email=?
    `,
    [email],
    async (err, emails) => {
      if (err) {
        console.log(err);
      }
      if (emails.length) {
        console.log("Error: Email in use already");
        res.status(409).json({ message: "Email already in use" });
      }

      const validPassword = schema.validate(password);
      const passwordsMatch = password === passwordConfirmation;

      if (!validPassword) {
        console.log("Password is invalid");
        res.status(400).json({ message: "Password is invalid" });
      }

      if (!passwordsMatch) {
        console.log("Passwords Don't Match");
        res.status(400).json({ message: "Passwords don't match" });
      }

      if (validPassword && passwordsMatch && !emails.length) {
        // Add to User Database, Succesful Response
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashed = await bcrypt.hash(password, salt);

        console.log(`Hashed: ${hashed}`);
        db.run(
          `INSERT INTO users(email,password_encrypted)
                VALUES (?,?)
        `,
          [email, hashed],
          (err) => {
            if (err) {
              return console.log(err.message);
            }
            console.log(`User registered`);
          }
        );
        res.status(200).json("message: success");
      }
    }
  );
});

app.post("/api/sessions", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  db.get(
    `SELECT email,password_encrypted,id FROM users
          WHERE email=?
  
  `,
    [email],
    async (err, user) => {
      console.log(req.cookies.sessionID);
      if (err) {
        res.status(400).json({ message: err.message });
        return;
      }
      if (req.cookies.sessionID) {
        res.clearCookie("sessionID");
        res.status(200).json({ message: "logged out" });
        return;
      }
      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Error: No matching email" });
      } else {
        const matched = await bcrypt.compare(password, user.password_encrypted);
        console.log(matched);
        //matched = false;
        if (matched) {
          const sessionID = uuidv4();
          console.log(user.id);
          db.run(
            `INSERT INTO sessions (uuid, user_id, created_at) VALUES (?, ?, datetime('now'))`,
            [sessionID, user.id]
          );
          res.cookie("sessionID", sessionID, { maxAge: 120000 });

          res.status(200).json({ success: true, message: "Successful login" });
        } else {
          res
            .status(401)
            .json({ success: false, message: "Error: Incorrect Password" });
        }
      }
    }
  );
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
