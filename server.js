var express = require('express')
let app = express();
let path = require('path');
var mysql = require('mysql');

var bodyParser = require('body-parser');
var connection = mysql.createConnection({
    host:'tvdrzajhtt79sf.cnuipuiqebbi.us-east-1.rds.amazonaws.com',
    user:'admin',
    password:'password123',
    database:'appDB',
    multipleStatements: true
});

app.use(express.static(path.join(__dirname, 'public')));
var urlencodedParser = bodyParser.urlencoded({extended:false})

connection.connect(function(err) {
    if (err) {
      console.error('Database connection failed');
      return;
    }
  
    console.log('Connected to database.');
  });

  function createUserTable(){
    var sql = "CREATE TABLE users (ID INT NOT NULL AUTO_INCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255),password VARCHAR (100),accounttype VARCHAR (20) ,PRIMARy KEY(ID)) ";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          console.log("User Table Created");
    })
    
    
  }

  function createPlanTable(){
    var sqls = "CREATE TABLE plans (id INT NOT NULL AUTO_INCREMENT, type VARCHAR(255) NOT NULL, active varchar(1),customerid int not null,  PRIMARy KEY(ID) , FOREIGN KEY (customerid) REFERENCES users (ID)) ";
    connection.query(sqls, function (err, result) {
       if (err) throw err;
       console.log("Plans Table Created");
   })
  }


  function dropTables(){
      var drop = "drop table users;drop table plans";

      connection.query(drop, function (err, result) {
         if (err) throw err;
         console.log("Plans Table Dropped");
     })
   
  }





app.post('/saveuser',urlencodedParser   , (req, res) => {
    let body = req.body;
    var  first_names = body.firstname;
    var  last_names = body.lastname;
    var  passwords = body.pass;
    var  accounttypes = body.type;
    var  emails = body.email;


    var values = {first_name:first_names,
                    last_name:last_names,
                    password:passwords,
                    email:emails,
                    accounttype:accounttypes
                }

    var sql = "INSERT INTO users SET ?";
    connection.query(sql ,values,function (err, result) {
    if (err) throw err;
    console.log(result,err);
    })
    res.sendFile(path.join(__dirname + '/login.html'));
})
var account = null;
var accountid = null;
app.post('/getloggedin',urlencodedParser, (req, res) => {
    var body = req.body;
    var email = body.email;
    var password = body.pass;
    // console.log(body);

    var cred = 'SELECT id,password from users where email = ?';
    connection.query(cred, email,function (err, result) {
        if (err) throw err;
        // console.log(result);
        if (result[0]['password'] == password){
            accountid =result[0]['id'];
            account = email;
            res.sendFile(path.join(__dirname + '/home.html'));

        }
        else{
            res.redirect('/log-in');
            // console.log(result[0]['password']);
        }
    })

});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'));
})

app.get('/sign-up', (req, res) => {
    if(accountid !=null){
    res.sendFile(path.join(__dirname + '/profile.html'));

    }
    else
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
app.get('/profile/get',(req,res)=>{
    console.log(account);
    var cred = `SELECT * from users where users.id = `+accountid+` `;
    connection.query(cred, function (err, result) {
     console.log(result,err);
    res.send((result));
})
});

app.get('/profile/plan',(req,res)=>{
    var cred = 'SELECT * from plans where plans.customerid = ?';
    connection.query(cred, accountid,function (err, result) {
        // console.log(result)
    res.send((result));
})
});


app.post('/profile/add/free',(req,res)=>{
    var values =
    {
        type:'free',
        active:'1',
        customerid:accountid
    }
    var insert = 'INSERT INTO plans SET ? ';
    connection.query(insert, values,function (err, result) {
    res.sendFile(path.join(__dirname + '/home.html'));
})
});

app.post('/profile/add/basic',(req,res)=>{
    var values =
    {
        type:'basic',
        active:'1',
        customerid:accountid
    }
    var insert = 'INSERT INTO plans SET ? ';
    connection.query(insert, values,function (err, result) {
     
    res.send((result));
})
});

app.post('/profile/add/enterprise',(req,res)=>{
    var values =
    {
        type:'enterprise',
        active:'1',
        customerid:accountid
    }
    var insert = 'INSERT INTO plans SET ? ';
    connection.query(insert, values,function (err, result) {
    res.send((result));
})
});




app.listen(8080);