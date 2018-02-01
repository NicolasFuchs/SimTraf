let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let app = express();
let gen = require('./generator.js');
let sel = require('./selector.js');
let pat = require('./pathFinder.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let creator = require('./creator.js');
let stockor = require('./stockor.js');
app.get('/creation', function(req, res) {
    gen.generator(parseFloat(req.query.NE_lat), parseFloat(req.query.NE_lng), parseFloat(req.query.SW_lat), parseFloat(req.query.SW_lng), function(msg) {
        sel.selector(msg, req.query.type, req.query.name, function(vehicles) {
            pat.pathFinder(vehicles, msg, req.query.type, function(vehiclesAndPathes) {
                stockor.stockor(vehiclesAndPathes, function(statuscode) {
                    if (statuscode/100 === 2) {
                        creator.creator(req.query.name, req.query.location, req.query.type, function() {
                            creator.choice(function(grid) {
                                res.header("Access-Control-Allow-Origin", "*");
                                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                                res.send(grid);
                            });
                        });
                    }
                });
            });
        });
    });
});

app.get('/grid', function(req, res) {
    creator.choice(function(grid) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(grid);
    });
});

let gettor = require('./gettor.js');
app.get('/choice', function(req, res) {
    gettor.gettor(req.query.name, function(entities) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(entities);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
