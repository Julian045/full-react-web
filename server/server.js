const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const app = express();
const port = 8080;

let users = [];

fs.readFile(path.join(__dirname, './users.json'), 'utf8', (err, data) => {
  if (err) {
    console.log('Error occurred while loading user data:', err);
  } else {
    users = JSON.parse(data);
  }
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'p1th',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/public/main.js', (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'public', 'main.js');
  res.setHeader('Content-Type', mime.getType(filePath));
  res.sendFile(filePath);
});

app.get('/check-session', (req, res) => {
  const { username } = req.cookies;
  const user = users.find(user => user.username === username);
  if (req.session && req.session.loggedIn && user) {
    res.status(200).json({ id: user.id, username: user.username });
  } else {
    res.sendStatus(401); // Unauthorized
  }
});

app.post('/userRegister', (req, res) => { // Register
  const username = req.body.registerUsername;
  const password = req.body.registerPassword;
  const usernameRegex = /^[a-zA-Z0-9_-]{4,16}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  const user = users.find(user => user.username === username);

  if(user) {
      res.status(401).json({ error: 'Username already exists.'});
      return;
  }

  if (!usernameRegex.test(username)) {
      res.status(401).json({ error: 'Username must be 4 to 16 characters.' });
      return;
  }

  if (!passwordRegex.test(password)) {
      res.status(401).json({ error: 'password_regex'});
      return;
  }

  const newUser = {
      id: generateUUID(),
      username,
      password
  };

  users.push(newUser);

  req.session.loggedIn = true;
  res.cookie('username', username, { httpOnly: true });

  fs.writeFile('./users.json', JSON.stringify(users, null, 2), (err) => {
      if (err) {
          console.log('Error occurred while saving user data:', err);
          res.status(500).json('Internal Server Error');
      } else {
          res.status(200).json({ message: 'success' });
      }
  });
});

app.post('/userLogin', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    res.sendStatus(401); // Unauthorized
  } else {
    res.cookie('username', username, { httpOnly: true });
    req.session.loggedIn = true;
    res.status(200).json({ id: user.id, username: user.username });
  }
});

app.delete('/deleteAccount', (req, res) => {
  const { username, password } = req.body;

  fs.readFile('./users.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
  
    let users = JSON.parse(data);

    // Find the user
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
      res.sendStatus(401);
      return;
    }

    // Remove the user from the array
    users = users.filter(user => user.username !== username);

    fs.writeFile('./users.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      let now = new Date();

      console.log(`[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] User: ${username} Password: ${password} deleted his account.`);

      req.session.loggedIn = false;
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.sendStatus(500); // Internal Server Error
        } else {
          res.clearCookie('connect.sid'); // Clear session cookie
          res.sendStatus(200); // OK
        }
      });
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500); // Internal Server Error
    } else {
      res.clearCookie('connect.sid'); // Clear session cookie
      res.sendStatus(200); // OK
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function generateUUID() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let uuid = '';

  for (let i = 0; i < 32; i++) {
    uuid += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  uuid = `${uuid.substr(0, 8)}-${uuid.substr(8, 4)}-${uuid.substr(12, 4)}-${uuid.substr(16, 4)}-${uuid.substr(20)}`;

  return uuid;
}