const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello');
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL};
  return res.render("urls_show", templateVars);
});

app.post('/urls', (req,res) => {
  console.log(req.body.longURL); //log the POST request body to the console
  // want to push the shortURL-longURL key-value pair to the URLDatabase
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = 'http://' + req.body.longURL
  res.redirect(`/urls/${shortURL}`) // Respond with 'Ok' 
})



app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});