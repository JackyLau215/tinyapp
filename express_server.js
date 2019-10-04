const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt'); 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

cookieParser = require('cookie-parser');
app.use(cookieParser())

app.set("view engine", "ejs");

const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },  
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const urlsForUser = (id) => {
  let result = {};
  for (urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      result[urls] = urlDatabase[urls];
    }
  }
  return result;
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

const emailCheck = (test) => {
  for (search in users) {
    if (users[search].email === test) {
      return true;
    }
  }
};

const getUserByEmail = (email) => {
  for (user in users) {
    if (users[user].email === email)  {
      return users[user]
    }
  }
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

//adding routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Add a route for /urls
app.get("/urls", (req, res) => {
  if (!req.cookies["userID"]) {
    res.redirect("/login");
  } else {
    let templateVars = { 
      urls: urlsForUser(req.cookies["userID"]), 
      user: users[req.cookies["userID"]]
    };
    console.log(templateVars)
    res.render("urls_index", templateVars); 
  }
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  let newShort = generateRandomString();
  urlDatabase[newShort] = { longURL: req.body.longURL, userID: req.cookies["userID"] };
  //req.process(longURL);
  res.redirect(`/urls/${newShort}`);
  console.log(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["userID"]] };
  if (!req.cookies["userID"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars)
  };
});

//Add short URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["userID"]) {
    res.send("You are not logged in!");
    res.redirect("/login");
  } else {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["userID"]] };
  res.render("urls_show", templateVars);
  }
});

//Redirect to LongURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL); 
});

//Add Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies["userID"]) {
      res.send("You are not logged in!");
      res.redirect("/login");
  } else {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
  }
});

//Changing longURL while keeping shortURL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//GET login Endpoint & Template
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["userID"]] };
  res.render("login", templateVars);
});

//Endpoint to handle a POST to /login
app.post("/login", (req, res) => {
  if (req.body.email === "") {
    res.status(403);
    res.send('Code 403, email address not found');
  } 
  const user = getUserByEmail(req.body.email)
console.log(user.password);
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403);
    res.send('Code 403, invalid password')
  } else {
    res.cookie("userID", user.id);
    res.redirect("/urls");
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});


//Get Register endpoint & Template
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["userID"]] };
  res.render("register", templateVars);
});

//Post Register endpoint
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('Code 400, please enter a valid email or password');
  } else if (emailCheck(req.body.email)) {
    res.status(400);
    res.send('Code 400, email already used')
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10); 
    const newID = generateRandomString();
    users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  }
  // console.log((users));
  res.cookie("userID", newID);
  res.redirect("/urls");
  };
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




