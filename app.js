// Required Modules
var createError = require('http-errors'); 
var express = require('express');//Node.js web application framework
var path = require('path'); // handling and transforming file paths
var bodyParser = require('body-parser'); // middleware 
var cookieParser = require('cookie-parser');
var logger = require('morgan');  
var cors = require('cors');

global.__basedir = __dirname; 


// Routers
var loginRouter = require('./routes/login');

var compression = require('compression');
var helmet = require('helmet');

var app = express(); // declare app
const port = `3004`; //server port num


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));


// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/api', loginRouter); // API routes to middleware chain. 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  res.render('error');
  /* res.json({
    message: err.message,
    error: err 
  }); */ 

});

app.listen(port, () => console.log(`TANSHIQ app is listening on port ${port}!`));

module.exports = app;