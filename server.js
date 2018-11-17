var express = require('express')

let app = express();

let path = require('path');

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