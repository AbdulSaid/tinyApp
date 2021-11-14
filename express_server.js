const express = require('express');
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require('body-parser');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: "sesson",
  keys: ['email']
}))

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
  "aJ48lW": {
    id: "aJ48lW",
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
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const findUserByEmail = (email) => {
  const userInfo = Object.values(users);
  for (const user of userInfo) {
    if (user.email === email) {
      return user;
    }
  }
  return null
}
const findUserPassword = (password) => {
  const userInfo = Object.values(users);
  for (const user of userInfo) {
    if (user.password === password) {
      return user;
    }
  }
  return null
}

// Function to find the urls for each user
const urlsForUser = function(id) {
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (const shortURL of keys) {
    const url = urlDatabase[shortURL]
    console.log('url',url)
    if (url.userID === id){
      results[shortURL] = url
    }
  }
  return results;
}


app.get('/', (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  if (!user) {
    return res.status(401)
    .send("You must <a href='/login'>login</a> first");
  }
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  if (!user) {
    return res.status(401)
    .send("You must <a href='/login'>login</a> first");
  }


  const urls = urlsForUser(userID);
  console.log('urls in get urls',urls)
  const templateVars = {
    urls: urls,
    user: user
  }

  res.render("urls_index", templateVars)
});





app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id'];
  const user = users[id];
  if (!user) {
    return res.redirect('/login')
  }
  

  res.render("urls_new", { user });
});

// app.post("/urls/new", (req, res) => {
//   const id = req.cookies['user_id'];
//   const user = users[id];
//   if (!user) {
//     return res.redirect('/login')
//   }
//   const shortURL = req.params.shortURL;
//   const url = urlDatabase[shortURL];

//   console.log('url.userID', url.userId)
//   console.log('id',id);
  
//   if (url.userID !== id) {
//     return res.status(401)
//     .send("You don't have access to this url. Please <a href='/login'>login</a> first");
//   }
//   urlDatabase[shortURL] = 'http://' + req.body.longURL

//   const templateVars = {
//     shortURL: shortURL,
//     url: url,
//     user: user
//   }
//   console.log('templatevars',templateVars)
 
//   res.redirect(`/urls/${shortURL}`,templateVars)
// });

app.get("/u/:shortURL", (req, res) => {
  // find a way to access the database at the shortURL key, then user will be redirected to longURL
  const id = req.cookies['user_id'];
  const user = users[id];
  if (!user) {
    return res.redirect('/login')
  }

  const shortURL = req.params.shortURL;
   console.log(shortURL);
   const longURL = urlDatabase[shortURL]
   console.log(longURL) 
  // res.redirect(longURL);
  res.redirect(longURL)
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  if (!user || !userID) {
    return res.status(401)
    .send("Please <a href='/login'>login</a> first");
  }

  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (url.userID !== user.id) {
    return res.status(401)
    .send("You don't have access to this url. Please <a href='/login'>login</a> first");
  }
  const templateVars = {
    shortURL: shortURL,
    url: url,
    user: user
  }
  console.log("shorturl in urls:short url", shortURL)
  // console.log("longURL",templateVars)
  return res.render("urls_show", templateVars);
});

app.post('/urls', (req,res) => {
  const userId = req.cookies['user_id'];
  console.log(req.body.longURL); //log the POST request body to the console
  // want to push the shortURL-longURL key-value pair to the URLDatabase
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: 'http://' + req.body.longURL,
    userID: userId
  }
  res.redirect(`/urls/${shortURL}`) // Respond with 'Ok' 
});


app.post('/urls/:shortURL/', (req,res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  if (!user || !userID) {
    return res.status(401)
    .send("Please <a href='/login'>login</a> first");
  }

  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (url.userID !== user.id) {
    return res.status(401)
    .send("You don't have access to this url. Please <a href='/login'>login</a> first");
  }

  // if starts with http, then append req.body.longURL
  // if not apped http
  const newInputURL = 'http://' + req.body.longURL
  
  url.longURL = newInputURL;
  
  console.log("we are testing this out");
  console.log("newInputURL",newInputURL);
  console.log("databaseChange", url);
  // urlDatabase[shortURL] = 'http://' + req.body.longURL
 

  // const templateVars = {
  //   shortURL: shortURL,
  //   url: url,
  //   user: user
  // }
  // console.log('templatevars',templateVars)
 
  res.redirect(`/urls/${shortURL}`) // Respond with 'Ok' 
});



app.post('/urls/:shortURL/delete', (req,res) => {
  // Get the shortURL from the params
  const shortURL = req.params.shortURL;
  // Delete it from that specific key from the database
  delete urlDatabase[shortURL]
  res.redirect(`/urls`) 
});

app.get('/login', (req, res) => {
  const id = req.cookies['user_id']
  const user = users[id];
  if (user) {
    return res.redirect('/urls');
  }
  return res.render("urls_login", { user });
});

app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email); // helper function from above to check if the user email exist in the database

  // check if user has puts in a email or password
  if (!user) {
    return res.status(400)
    .send("Wrong email. Please <a href='/login'>try again</a>");
  }
  if (user.password !== password) {
    return res.status(400)
    .send("Wrong password. Please <a href='/login'>try again</a>");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls")

});
app.get('/register', (req, res) => {
  const id = req.cookies['user_id']
  const user = users[id];
  if (user) {
    return res.redirect('/urls');
  }

  res.render("urls_registration", { user });
});

app.post('/register', (req,res) => {
  // set a cookie named user_id
  const userId = generateRandomString()
  const userEmail = req.body.email
  const userPassword = req.body.password
  if (!userEmail) {
    return res.status(400)
    .send("Missing email. Please <a href='/register'>try again</a>");
  }
  if (!userPassword) {
    return res.status(400)
    .send("Missing password. Please <a href='/register'>try again</a>");
  }

  if (findUserByEmail(userEmail)) {
    return res.status(400)
    .send("Email already exist. Please <a href='/register'>try again</a>");
  }

  const user = {
    id: userId,
    email: userEmail,
    password: userPassword
  }

  
  users[userId] = user;
  
  res.cookie('user_id', userId)
  res.redirect(`/urls`) 
});

app.post('/logout', (req,res) => {
  // set a cookie named Username 
  res.clearCookie("user_id");
  res.redirect(`/urls`) 
});



app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});