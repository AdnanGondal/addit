// server/index.js

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const getTitleAtUrl = require("get-title-at-url");
const passwordValidator = require("password-validator");
const e = require("express");

const app = express();
let db = new sqlite3.Database("./server/stories.db");

// PASSWORD REQUIREMENTS
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

app.use(bodyParser.json());
app.use(cors());

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
      //console.log(stories);
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
      console.log(title);
      console.log(url);
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

app.post("/api/users/", (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  db.all(
    `SELECT email FROM users
    WHERE email=?
    `,
    [email],
    (err, emails) => {
      if (err) {
        console.log(err);
      }
      if (emails.length) {
        console.log("Error: Email in use already");
        res.status(409).json({ message: "Email already in use" });
      }

      // Password validation
      const validPassword = schema.validate(password);
      if (!validPassword) {
        console.log("Password is invalid");
        res.status(400).json({ message: "Password is invalid" });
      }
      // Check Passwords Match
      const passwordsMatch = password === passwordConfirmation;
      if (!passwordsMatch) {
        console.log("Passwords Don't Match");
        res.status(400).json({ message: "Passwords don't match" });
      }

      // Add to User Database, Succesful Response
      if (validPassword && passwordsMatch && !emails.length) {
        console.log("valid password and email");
        db.run(
          `INSERT INTO users(email,password)
                VALUES (?,?)
        `,
          [email, password],
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

app.post("/api/sessions", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT email,password FROM users
          WHERE email=?
  
  `,
    [email],
    (err, user) => {
      if (err) {
        res.status(400).json({ message: err.message });
      }

      if (!user) {
        res
          .status(401)
          .json({ success: false, message: "Error: No matching email" });
      } else if (user.password === password) {
        res.json({ success: true });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Error: Incorrect Password" });
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
