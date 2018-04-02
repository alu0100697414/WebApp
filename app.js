//Load app dependencies
var express = require('express'),
    mongoose = require('mongoose'),
    expressLayouts = require('express-ejs-layouts'),
    path = require('path'),
    http = require('http');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var passport = require('passport');
var nodemailer = require('nodemailer');
var fs = require('fs');
var https = require('https');

var app = express();

app.enable('view cache');

// Credencials
const privateKey  = fs.readFileSync('certs/key.pem', 'utf8');
const certificate = fs.readFileSync('certs/cert.pem', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  passphrase: '1234'
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.set('layout', path.join(__dirname, 'app/views')); // defaults to 'layout'

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'uwotm8'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){

    // Save path to redir after login
    if(!req.path.match(/\/login|\/logout/)){
        req.session.redir = req.path;
    }

    // Make visible session in views
    res.locals.session = req.session;
    next();
});

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

var server = http.createServer(app);

//Sample routes are in a separate module, just for keep the code clean
routes = require('./routes/routes')(app);
//Connect to the MongoDB test database
mongoose.connect('mongodb://localhost/atlas_db');

/**
 * Launching
 */
var httpServer = http.createServer((req, res) => {
  var host = req.headers['host'].split(":");
  var name = host[0];
  var port = 80;
  if (host.length > 1) {
    port = host[1];
  }
  res.writeHead(301, { "Location": "https://" + name + ":8000" + req.url });
  res.end();
});

var httpsServer = https.createServer(credentials, app);

// If you are in Linux-based OS, you must execute as root or you must change the ports under 1024
// For example: 80 -> 8080 and 443 -> 8443
httpServer.listen(8881, () => {
  console.log('Application is running in non-safe mode over the port 8881');
  console.log('All traffic will be redirect to https server');
});

httpsServer.listen(8000, () => {
  console.log('Application is running in safe mode over the port 8000');
});


app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST", "PUT", "DELETE");
    next();

});


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
