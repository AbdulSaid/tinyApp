const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// setting ejs as the engine
app.set('view engine','ejs');

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = 6;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    randomString += characters[randomNum];
  }
  return randomString
}

const users = {
  "GreenId": {
    id: "GreenID",
    email: "green@example.com",
    password: "greenapples"
  },
  "BlueId": {
    id: "BlueID",
    email: "blue@example.com",
    password: "blueapples"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const findUserByEmail = (email) => {
  for (key in users) {
    if (users[key].email === email) {
      return users[key]
    }
  }
  return null
}
const findUserPassword = (password) => {
  for (key in users) {
    if (users[key].password === password) {
      return users[key]
    }
  }
  return null
}


app.get('/', (req, res) => {
  res.send('Hello');
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.user_id]
  }
  return res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.userId]
  }
  return res.render("urls_registration", templateVars);
});



app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.user_id]
  }
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL],
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.user_id]
  }
  // console.log("longURL",templateVars)
  return res.render("urls_show", templateVars);
});

app.post('/urls', (req,res) => {
  console.log(req.body.longURL); //log the POST request body to the console
  // want to push the shortURL-longURL key-value pair to the URLDatabase
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = 'http://' + req.body.longURL
  res.redirect(`/urls/${shortURL}`) // Respond with 'Ok' 
});



app.post('/urls/:shortURL/', (req,res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.user_id]
  }
  console.log('req body',req.body); //log the POST request body to the console
  // want to push the shortURL-longURL key-value pair to the URLDatabase
  const shortURL = req.params.shortURL;
  console.log("short URL",shortURL)
  urlDatabase[shortURL] = 'http://' + req.body.longURL
  res.redirect(`/urls/${shortURL}`) // Respond with 'Ok' 
});

app.get("/u/:shortURL", (req, res) => {
  // find a way to access the database at the shortURL key, then user will be redirected to longURL
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.userId]
  }
  const shortURL = req.params.shortURL;
   console.log(shortURL);
   const longURL = urlDatabase[shortURL]
   console.log(longURL) 
  // res.redirect(longURL);
  res.redirect(longURL)
});

app.post('/urls/:shortURL/delete', (req,res) => {
  // Get the shortURL from the params
  const shortURL = req.params.shortURL;
  // Delete it from that specific key from the database
  delete urlDatabase[shortURL]
  res.redirect(`/urls`) 
});

app.get('/login', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.userId]
  }
  return res.render("urls_login", templateVars);
});

app.post('/login', (req,res) => {
  // check to see if email is in system
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.userId]
  }
  const foundUser = findUserByEmail(req.body.email);
  const foundPassword = findUserPassword(req.body.password);
  if (foundUser) {
    console.log("I have found the user",foundUser)
    if (foundPassword) {
      console.log("I have found the password",foundPassword)
      res.cookie("user_id", foundUser.id)
    res.redirect(`/urls`) 
    } else {
      res.status(403);
      res.send("Wrong Password")
    }
  } else {
    res.status(403);
    res.send('User does not exist');
  }
});

app.post('/register', (req,res) => {
  // set a cookie named user_id
  const userId = generateRandomString()
  const userEmail = req.body.email
  const userPassword = req.body.password
  if (userEmail === "") {
    res.status(400)
    res.send("Username is empty")
    return {error: "Please input an email address", data: null};
  }

  if (userPassword === "")  {
    res.status(400)
    res.send("Password is empty")
    
  }

  for (let email in users) {
    if (users[email].email === userEmail) {
      res.status(400)
      res.send("Email is already taken");
      return {error: "Please enter a new email", data: null}
    }
  }
  
  users[userId] = {
      id: userId,
      email: userEmail,
      password: userPassword
    
  } 
  res.cookie('user_id', userId)

  res.redirect(`/login`) 
});

app.post('/logout', (req,res) => {
  // set a cookie named Username 
  const templateVars = { 
    urls: urlDatabase,
    user: null
  };
  if (req.cookies.user_id) {
    templateVars.user = users[req.cookies.userId]
  }
  res.clearCookie("user_id", req.body.user_id);
  console.log('req body username',req.body.userName)
  res.redirect(`/urls/`) 
});



app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});