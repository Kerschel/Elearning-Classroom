var prefix = "";
var PORT = 8080;
var CONFIG_TABLENAME = prefix + "config";
var USERS_TABLE = prefix + "users";
var PLANS_TABLE = prefix + "plans";

var express = require('express')
let app = express();
let path = require('path');
var mysql = require('mysql');

var bodyParser = require('body-parser');
var connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database:process.env.MYSQL_DATABASE,
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
    /* First time run */
    //var sql = "select count(*) as exists from information_schema.tables where table_schema='" + process.env.DATABSE_HOST + "'";
    var sql = "select count(*) as cnt from information_schema.tables where table_schema='" + process.env.DATABASE_HOST + "' and table_name ='" + CONFIG_TABLENAME + "'";
    connection.query(sql, function (err, result) {
      if (err) {
        console.error('Initial Load failed');
        return;
      }
      console.log(result);
      if (result[0].cnt == 0 ) {
        var sql = "CREATE TABLE " + CONFIG_TABLENAME + "(ID INT NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, value text not null, PRIMARY KEY(ID))";
        connection.query(sql, function (err, result) {
          if (err) {
            return;
          }
          console.log("Config table created");
        });
        var sql = "INSERT INTO " + CONFIG_TABLENAME + "(ID, name, value) values (null, 'setup_complete', '1')";
        connection.query(sql, function (err, result) {
          if (err) {
            return;
          }
          console.log("Config table populated");
        });

        var sql = "CREATE TABLE " + USERS_TABLE + " (ID INT NOT NULL AUTO_INCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255),password VARCHAR (100),accounttype VARCHAR (20) ,PRIMARY KEY(ID)) ";
        connection.query(sql, function (err, result) {
          if (err) {
            return;
          }
          console.log("Users table created");
        });

        var sql = "CREATE TABLE " + PLANS_TABLE + " (id INT NOT NULL AUTO_INCREMENT, type VARCHAR(255) NOT NULL, active varchar(1),customerid int not null,  PRIMARy KEY(ID) , FOREIGN KEY (customerid) REFERENCES users (ID)) ";
        connection.query(sql, function (err, result) {
          if (err) {
            return;
          }
          console.log("Plan table created");
        });
      }
    });
  });






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

    var sql = "INSERT INTO " + USERS_TABLE + " SET ?";
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

    var cred = 'SELECT id,password from ' + USERS_TABLE + ' where email = ?';
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
    var cred = `SELECT * from ` + USERS_TABLE + ` where users.id = `+accountid+` `;
    connection.query(cred, function (err, result) {
     console.log(result,err);
    res.send((result));
})
});

app.get('/profile/plan',(req,res)=>{
    var cred = 'SELECT * from ' + PLANS_TABLE + ' where plans.customerid = ?';
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
    var insert = 'INSERT INTO ' + PLANS_TABLE + ' SET ? ';
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
    var insert = 'INSERT INTO ' + PLANS_TABLE + ' SET ? ';
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
    var insert = 'INSERT INTO ' + PLANS_TABLE + ' SET ? ';
    connection.query(insert, values,function (err, result) {
    res.send((result));
})
});




app.listen(8080);
