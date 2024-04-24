const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Serve static files from the same directory as your server.js file
app.use(express.static(path.join(__dirname)));

let db = new sqlite3.Database('./snapDB.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

app.get('/cards', (req, res) => {
  db.all('SELECT * FROM Cards order by Series, Cost', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

let currentDeck = [];

app.post('/snakedraft', (req,res) => {
  currentDeck = JSON.parse(req.body.deck);
  res.redirect('/snakedraft.html');
});

app.get('/deck', (req,res) => {
  res.json(currentDeck);
});

// This will serve the images from your 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

