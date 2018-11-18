var express = require('express')
let app = express();
let path = require('path');
var mysql = require('mysql');

var bodyParser = require('body-parser');
var connection = mysql.createConnection({
    host:'tvdrzajhtt79sf.cnuipuiqebbi.us-east-1.rds.amazonaws.com',
    user:'admin',
    password:'password123',
    database:'appDB'
});
connection.connect(function(err) {
    if (err) {
      console.error('Database connection failed');
      return;
    }
  
    console.log('Connected to database.');
  });

  function createTables(){
    // var sql = "CREATE TABLE users (ID INT NOT NULL AUTO_INCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255),password VARCHAR (100),accounttype VARCHAR (20) ,PRIMARy KEY(ID)) ";
//    var id =1;
//    var first_name ='kj';
//     var sql = "INSERT INTO users VALUES(id,first_name,'James','kerschels@hotmail.com','testing123','teacher')";
    
    //     connection.query(sql, function (err, result) {
    //       if (err) throw err;
    //       console.log("User Table Created");
    // })
    
     var sqls = "CREATE TABLE plans (id INT NOT NULL AUTO_INCREMENT, type VARCHAR(255) NOT NULL, active varchar(1),customerid int not null,  PRIMARy KEY(ID) , FOREIGN KEY (customerid) REFERENCES users (ID)) ";
     connection.query(sqls, function (err, result) {
        if (err) throw err;
        console.log("Plans Table Created");
    })
  }


  function dropTables(){
      var drop = "drop table users ";
      var dropplans = "drop table plans";


    //   connection.query(drop, function (err, result) {
    //      if (err) throw err;
    //      console.log("Plans Table Dropped");
    //  })
     connection.query(dropplans, function (err, result) {
        if (err) throw err;
        console.log("Plans Table dropped");
    })
  }

//   var sqls = "INSERT into plans VALUES (1,'free','1',1)";
//   var sqls = "select *";

//      connection.query(sqls, function (err, result) {
//         if (err) throw err;
//         console.log(result);
//     })
// dropTables();
// createTables();
app.use(express.static(path.join(__dirname, 'public')));
var urlencodedParser = bodyParser.urlencoded({extended:false})

app.post('/saveuser',urlencodedParser   , (req, res) => {
    let body = req.body;
    var  first_name = body.firstname;
    var  last_name = body.lastname;
    var  password = body.pass;
    var  accounttype = body.type;
    var  email = body.email;


    
    var sql = "INSERT INTO users VALUES(15,"+first_name+","+last_name+","+email+","+password+","+accounttype+")";
        // var sql = "INSERT INTO users VALUES(1,'Kerschel','James','kerschels@hotmail.com','testing123','teacher')";

    connection.query(sql ,function (err, result) {
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
    var cred = 'SELECT id,password from users where email = email';
    connection.query(cred, function (err, result) {
        if (err) throw err;
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
    var cred = 'SELECT * from plans where plans.customerid in (SELECT id FROM users where id = '+accountid+')';
    connection.query(cred, function (err, result) {
    res.send((result));
})
});



app.get('/profile/add/free',(req,res)=>{
    // var email = 'kerschels@hotmail.com'
    // var insert = 'INSERT INTO plans ';
    connection.query(cred, function (err, result) {
     
    res.send((result));
})
});




app.listen(8080);