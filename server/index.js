// server/index.js

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const getTitleAtUrl = require("get-title-at-url");
const passwordValidator = require("password-validator");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 8;
const app = express();
app.use(bodyParser.json());
app.use(cors());

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
  .digits(1); // Must have at least 1 digit

// ROUTING

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
  const { url, title } = req.body;

  console.log(title);
  console.log(url);

  if (url && !title) {
    getTitleAtUrl(url, function (title) {
      if (!title) title = "Title Not Found";
      db.run(
        `INSERT INTO stories (title,url)
                            VALUES(?,?);
                            `,
        [title, url]
      );
      console.log("database updated");
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
});

app.get("/api/users/", (req, res) => {
  res.json({ message: "User sign up get request" });
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
          `INSERT INTO users(email,password_encrypted,salt)
                VALUES (?,?,?)
        `,
          [email, hashed, salt],
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
    `SELECT email,password_encrypted FROM users
          WHERE email=?
  
  `,
    [email],
    async (err, user) => {
      if (err) {
        res.status(400).json({ message: err.message });
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
