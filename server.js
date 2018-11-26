var prefix = "aas";
var PORT = 8080;
var CONFIG_TABLENAME = prefix + "config";
var USERS_TABLE = prefix + "users";
var PLANS_TABLE = prefix + "plans";

var express = require('express')
var session = require('express-session');
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
app.use(session({
    secret: 'virtual_knowledge_secret',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
var urlencodedParser = bodyParser.urlencoded({extended:true})

var db = require('./database');

var sess;
connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed');
    return;
  }
  console.log('Connected to database.');
  /* First time run */
  /* Checks if the config table has been made */
  sql = db.countConfig({
    MYSQL_DATABASE: process.env.MYSQL_DATABASE
  });
  connection.query(sql, function (err, result) {
    if (err){
      console.log("Error occurred");
      return;
    }
    /* If config not made then make setup tables */
    if (result[0].cnt == 0){
      console.log("Creating config");
      /* Create config table and populate it */
      sql = db.createConfig();
      connection.query(sql, function (err, result) {
        if (err){
          console.log("Error creating Config table");
          return;
        }
      });
      sql = db.insertConfig({
        ID: null,
        NAME: 'setup_complete',
        VALUE: '1'
      });
      connection.query(sql, function (err, result) {
        if (err){
          console.log("Error Adding data to Config table");
          return;
        }
      });

      /* Create user table and populate it with an admin user*/
      sql = db.createUser();
      connection.query(sql, function (err, result) {
        if (err){
          console.log("Error creating User table");
          return;
        }
      });
      sql = db.insertUser({
        FIRST_NAME: 'admin',
        LAST_NAME: 'admin',
        EMAIL: 'admin@velearning.com',
        PASSWORD: 'adminpw',
        ACCOUNTTYPE: 'Administrator'
      });
      connection.query(sql, function (err, result) {
        if (err){
          console.log("Error Adding data to User table");
          return;
        }
      });

      /* Create Plan table*/
      sql = db.createPlan();
      connection.query(sql, function (err, result) {
        if (err){
          console.log("Error creating Plan table");
          return;
        }
      });
    }
  });
});

/* Home Page */
app.get('/', (req, res) => {
  if (req.session.email){
    res.sendFile(path.join(__dirname + '/home_loggedin.html'));
  } else {
    res.sendFile(path.join(__dirname + '/home.html'));
  }
});

/* Sign up Page */
app.get('/sign-up', (req, res) => {
  if(req.session.email){
    res.sendFile(path.join(__dirname + '/profile.html'));
  } else {
    res.sendFile(path.join(__dirname + '/register.html'));
  }
});

/* Log in Page */
app.get('/log-in', (req, res) => {
  if (req.session.email){
    res.redirect('/profile');
  } else {
     res.sendFile(path.join(__dirname + '/login.html'));
  }
});
app.get('/log-out', (req, res) => {
  req.session.destroy(function(err) {
    if(err) {
      res.redirect('profile');
      return ;
    }
    res.redirect('/');
  });
});

/* Create the User */
app.post('/saveuser',urlencodedParser   , (req, res) => {
  let body = req.body;
  var  first_name = body.firstname;
  var  last_name = body.lastname;
  var  password = body.pass;
  var  accounttype = body.type;
  var  email = body.email;


  var values = {FIRST_NAME:first_name,
                  LAST_NAME:last_name,
                  PASSWORD:password,
                  EMAIL:email,
                  ACCOUNTTYPE:accounttype
              }
  sql = db.insertUser(values);
  connection.query(sql, function (err, result) {
    if (err) {
      console.log("Error making user");
      res.sendFile(path.join(__dirname + '/register.html'));
      return
    }
    if (accounttype == 'Teacher'){
      var sql = db.selectUserbyEmail({
        EMAIL: email
      });
      connection.query(sql, function (err, result) {
        if (err){
          return;
        }
        var values =
        {
            TYPE:'free',
            ACTIVE:'1',
            CUSTOMERID:result[0].ID
        }
        var sql = db.insertPlan(values);
        connection.query(sql, function (err, result) {
          if (err){
            return;
          }
        })
      });
    }
    req.session.email = email;
    res.redirect('/profile');
  });
})

/* verify user when logging in */
app.post('/getloggedin',urlencodedParser, (req, res) => {
  var body = req.body;
  var email = body.email;
  var password = body.pass;
  sql = db.verifyUser({
    EMAIL: email,
    PASSWORD: password
  });
  connection.query(sql,function (err, result) {
    if (err) {
      console.log("Error trying to verify password");
      res.redirect('/log-in');
      return;
    }
    try{
      if (result[0].verified == 1){
        /* Session stuff here */
        req.session.email = email;
        res.redirect('/profile');
      } else{
        res.redirect('/log-in');
      }

    } catch( e){
        res.redirect('/log-in');
    }
  })
});

app.get('/pricing', (req, res) => {
  if (req.session.email){
    res.sendFile(path.join(__dirname + '/pricing_loggedin.html'));
  } else {
    res.sendFile(path.join(__dirname + '/pricing.html'));
  }
})

app.get('/profile', (req, res) => {
  if (req.session.email){
    var sql = db.selectUserbyEmail({
      EMAIL: req.session.email
    });
    connection.query(sql, function (err, result) {
      if (err){
        res.redirect('/log-out')
        return;
      }
      try{
        switch (result[0].ACCOUNTTYPE){
          case 'Administrator':
            res.sendFile(path.join(__dirname + '/profile_admin.html'));
          break;
          case 'Teacher':
            res.sendFile(path.join(__dirname + '/profile.html'));
          break;
          default:
            res.sendFile(path.join(__dirname + '/profile_student.html'));
          break;
        }
      } catch (err){

      }
    });
  } else {
    res.redirect('/log-in');
  }
})

app.get('/profile/get',(req,res)=>{
  if (req.session.email){
    var sql = db.selectUserbyEmail({
      EMAIL: req.session.email
    })
    connection.query(sql, function (err, result) {
      if (err){
        res.send({});
        return;
      }
      res.send(result);
    });
  } else {
    res.send({});
  }
});

app.get('/profile/plan',(req,res)=>{
  if (req.session.email){
    var sql = db.selectPlanbyEmail({
      EMAIL: req.session.email
    })
    connection.query(sql, function (err, result) {
      if (err){
        res.send({});
        return;
      }
      res.send(result);
    });
  } else {
    res.send({});
  }
});

app.get('/profile/plan-admin',(req,res)=>{
  if (req.session.email){
    var sql = db.selectPlanAdmin({
      EMAIL: req.session.email
    });
    connection.query(sql, function (err, result) {
      if (err){
        res.send({});
        return;
      }
      res.send(result);
    });
  } else {
    res.send({});
  }
});


app.post('/profile/add/free',(req,res)=>{
  if (req.session.email){
    var sql = db.selectUserbyEmail({
      EMAIL: req.session.email
    });
    connection.query(sql, function (err, result) {
      if (err){
        res.send({});
        return;
      }
      var values =
      {
          TYPE:'free',
          ACTIVE:'1',
          CUSTOMERID:result[0].ID
      }
      var sql = db.insertPlan(values);
      connection.query(sql, function (err, result) {
        if (err){
          res.send({});
          return;
        }
        res.send({});
      })
    });

  } else {
    res.send({});
  }
});

app.post('/profile/add/basic',(req,res)=>{
  if (req.session.email){
    var sql = db.selectUserbyEmail({
      EMAIL: req.session.email
    });
    connection.query(sql, function (err, result) {
      if (err){
        res.send({});
        return;
      }
      var values =
      {
          TYPE:'basic',
          ACTIVE:'1',
          CUSTOMERID:result[0].ID
      }
      var sql = db.insertPlan(values);
      connection.query(sql, function (err, result) {
        if (err){
          res.send({});
          return;
        }
        res.send({});
      })
    });
  } else {
    res.send({});
  }
});

app.post('/profile/add/enterprise',(req,res)=>{
  if (req.session.email){
    var sql = db.selectUserbyEmail({
      EMAIL: req.session.email
    });
    connection.query(sql, function (err, result) {
      if (err){
        res.send({});
        return;
      }
      var values =
      {
          TYPE:'enterprise',
          ACTIVE:'1',
          CUSTOMERID:result[0].ID
      }
      var sql = db.insertPlan(values);
      connection.query(sql, function (err, result) {
        if (err){
          res.send({});
          return;
        }
        res.send({});
      })
    });
  } else {
    res.send({});
  }
});

/* Ajax Queries */
app.post('/verifyUser',(req,res) => {
  if (req.method === 'POST'){
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      temp = JSON.parse(body);
      var email = temp.email;
      var password = temp.password;
      sql = db.verifyUser({
        EMAIL: email,
        PASSWORD: password
      });
      connection.query(sql, email,function (err, result) {
        if (err){
          res.send("no");
          return;
        }
        try{
          if (result[0].verified == 1){
            res.send("yes");
          } else {
            res.send("no");
          }
        } catch (e){
          res.send('no');
        }
      });
    });
  }
});



app.listen(PORT);
