const { findUserByEmail } = require("./helpers");
const { generateRandomString } = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const bodyParser = require("body-parser");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

app.set("view engine", "ejs");

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "green@example.com",
    password: bcrypt.hashSync("greenapples", 10),
  },
  BlueId: {
    id: "BlueID",
    email: "blue@example.com",
    password: bcrypt.hashSync("blueapples", 10),
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const urlsForUser = function (id) {
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      results[shortURL] = url;
    }
  }
  return results;
};

app.get("/", (req, res) => {
  const userID = req.session.id;
  const user = users[userID];
  if (!user) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.id;
  const user = users[userID];
  if (!user) {
    return res.status(401).send("You must <a href='/login'>login</a> first");
  }
  const urls = urlsForUser(userID);
  const templateVars = {
    urls: urls,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.id;
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_new", { user });
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.id;
  const user = users[userID];
  if (!user || !userID) {
    return res.status(401).send("Please <a href='/login'>login</a> first");
  }

  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (userID !== user.id) {
    return res
      .status(401)
      .send(
        "You don't have access to this url. Please <a href='/login'>login</a> first"
      );
  }
  const templateVars = {
    shortURL: shortURL,
    url: url,
    user: user,
  };
  return res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.id;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/", (req, res) => {
  const userID = req.session.id;
  const user = users[userID];
  if (!user || !userID) {
    return res.status(401).send("Please <a href='/login'>login</a> first");
  }
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (url.userID !== user.id) {
    return res
      .status(401)
      .send(
        "You don't have access to this url. Please <a href='/login'>login</a> first"
      );
  }

  const newInputURL = req.body.longURL;
  url.longURL = newInputURL;
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const id = req.session.id;
  const user = users[id];
  if (user) {
    return res.redirect("/urls");
  }
  return res.render("urls_login", { user });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = findUserByEmail(users, email);
  const password = req.body.password;
  if (!user) {
    return res
      .status(400)
      .send("Wrong email. Please <a href='/login'>try again</a>");
  }

  if (user) {
    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        req.session.id = user.id;
        res.redirect("/urls");
      } else {
        return res
          .status(400)
          .send("Wrong password. Please <a href='/login'>try again</a>");
      }
    });
  }
});

app.get("/register", (req, res) => {
  const id = req.session.id;
  const user = users[id];
  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_registration", { user });
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const userEmail = req.body.email;

  const user = {
    id: userId,
    email: userEmail,
  };

  const userPassword = req.body.password;
  bcrypt.hash(userPassword, 10).then((result) => {
    user.password = result;
    if (!userEmail) {
      return res
        .status(400)
        .send("Missing email. Please <a href='/register'>try again</a>");
    }
    if (!userPassword) {
      return res
        .status(400)
        .send("Missing password. Please <a href='/register'>try again</a>");
    }

    if (findUserByEmail(users, userEmail)) {
      return res
        .status(400)
        .send("Email already exist. Please <a href='/register'>try again</a>");
    }

    users[userId] = user;

    req.session.id = user.id;
    res.redirect(`/urls`);
  });
});

app.post("/logout", (req, res) => {
  // clear sessions
  req.session = null;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {});
