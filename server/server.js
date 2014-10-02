var express = require('express'),
    config = require('./config'),
    ddos = new (require('ddos'))(),
    errorHandler = require('errorhandler'),
    lusca = require('lusca');
http = require('http'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose');

// MongoDB Connection
mongoose.connect(config.db);

var mongodbConnect = mongoose.connection;
mongodbConnect.on('error', console.error.bind(console, 'connection error:'));
mongodbConnect.once('open', function () {
    console.log('mongodb Connected');
});

var app = express();

var server = http.Server(app);
require("./controllers/socket")(server);

app.set('port', config.port);
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(lusca.xssProtection(true));
app.use(ddos.express);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    //res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    next();
});

// Gets data with Database
var api = require('./routes/api');
app.use('/api', api);

app.all('*', function (req, res) {
    res.status(400).send('Bad request');
});
// Error handler
app.use(errorHandler());

server.listen(app.get('port'), function () {
    console.info('Server listening on port ' + this.address().port);
});
