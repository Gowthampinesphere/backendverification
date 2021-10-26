// Database Connectivity
var mysql      = require('mysql'); 
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'tanshiqproject'
  });
  connection.connect(function(err){
  if(!err) { 
    console.log("Database is connected ... nn");
  } else {    
    console.log("Error connecting database ... nn");
  }
});
module.exports = connection;   

