var prefix = "";
var CONFIG_TABLENAME = prefix + "config";
var USERS_TABLE = prefix + "users";
var PLANS_TABLE = prefix + "plans";
/* config tables */
exports.createConfig = function(){
  var sql = "CREATE TABLE " + CONFIG_TABLENAME + "(ID INT NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, value text not null, PRIMARY KEY(ID))";
  return sql;
}
exports.insertConfig = function(arr){
  var sql = "INSERT INTO " + CONFIG_TABLENAME + "(ID, name, value) values ('"+ arr['ID'] + "','"+ arr['NAME'] + "','"+ arr['VALUE'] + "')";
  return sql
}
exports.countConfig = function(arr){
  var sql = "SELECT count(*) as cnt from information_schema.tables where table_schema='" + arr['MYSQL_DATABASE'] + "' and table_name ='" + CONFIG_TABLENAME + "'";
  return sql;
}

/* User tables */
exports.createUser = function (){
  var sql = "CREATE TABLE " + USERS_TABLE + " (ID INT NOT NULL AUTO_INCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE,password VARCHAR (100),accounttype VARCHAR (20) ,PRIMARY KEY(ID)) ";
  return sql;
}
exports.insertUser = function (arr){
  var sql = "INSERT INTO " + USERS_TABLE + "(first_name,last_name,email,password,accounttype) values ('" + arr['FIRST_NAME'] + "','" + arr['LAST_NAME'] + "','" + arr['EMAIL'] + "',sha1('" + arr['PASSWORD'] + "'), '" + arr['ACCOUNTTYPE'] + "')";
  return sql;
}
exports.verifyUser = function (arr){
  var sql = "SELECT case when sha1('" + arr['PASSWORD'] + "') = password then 1 else 0 end as verified from " + USERS_TABLE + " where email = '" + arr['EMAIL'] + "' ";
  return sql;
}
exports.selectUserbyID = function (arr){
  var sql = "SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, ACCOUNTTYPE from " + USERS_TABLE + " where id = '" + arr['ID'] + "'";
  return sql;
}
exports.selectUserbyEmail = function (arr){
  var sql = "SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, ACCOUNTTYPE from " + USERS_TABLE + " where email = '" + arr['EMAIL'] + "'";
  return sql;
}

/* Plan tables */
exports.createPlan = function (){
  var sql = "CREATE TABLE " + PLANS_TABLE + " (id INT NOT NULL AUTO_INCREMENT, type VARCHAR(255) NOT NULL, active varchar(1),customerid int not null, creation_timestamp timestamp not null,  PRIMARY KEY(ID) , FOREIGN KEY (customerid) REFERENCES users (ID)) ";
  return sql;
}
exports.insertPlan = function (arr){
  var sql = "INSERT INTO " + PLANS_TABLE + " (ID, TYPE, ACTIVE, CUSTOMERID, CREATION_TIMESTAMP) values (null,'" + arr['TYPE'] + "','" + arr['ACTIVE'] + "','" + arr['CUSTOMERID'] + "',current_timestamp)";
  return sql;
}
exports.selectPlanbyEmail = function (arr){
  var sql = "SELECT a.ID, a.TYPE, a.ACTIVE, a.CUSTOMERID, convert_tz(a.CREATION_TIMESTAMP,'+00:00','America/La_Paz') as CREATION_TIMESTAMP FROM " + PLANS_TABLE + " a, " + USERS_TABLE + " b where a.customerid = b.id and b.email = '" + arr['EMAIL'] + "' order by a.ID asc";
  return sql;
}
exports.selectPlanAdmin = function(arr){
  var sql = "SELECT b.EMAIL, b.FIRST_NAME, b.LAST_NAME, a.TYPE, a.ACTIVE, convert_tz(a.CREATION_TIMESTAMP,'+00:00','America/La_Paz') as CREATION_TIMESTAMP FROM " + PLANS_TABLE + " a, " + USERS_TABLE + " b where a.customerid = b.id and a.ID = (select max(b_ed.ID) from " + PLANS_TABLE + " b_ed where b_ed.customerid = a.customerid) order by b.ID";
  return sql;
}
