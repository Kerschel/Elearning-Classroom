var express = require('express')

let app = express();

let path = require('path');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'kerschel.cnuipuiqebbi.us-east-1.rds.amazonaws.com',
    user:'kerschel',
    password:'testdatabase',
    database:'kerschel',
    port:3306
});
connection.connect(function(err) {
    if (err) {
      console.error('Database connection failed');
      return;
    }
  
    console.log('Connected to database.');
  });
  // connection.query("SELECT * FROM ")

app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'));
})

app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(__dirname + '/register.html'));
})

app.get('/log-in', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));
})

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname + '/pricing.html'));
})

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname + '/profile.html'));
})

app.listen(8080);