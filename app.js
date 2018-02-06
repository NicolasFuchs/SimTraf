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
let gp = require('./GeneratedPoints.js');
app.get('/creation', function(req, res) {
    console.log("NE_lat = " + req.query.NE_lat);
    console.log("NE_lng = " + req.query.NE_lng);
    console.log("SW_lat = " + req.query.SW_lat);
    console.log("SW_lng = " + req.query.SW_lng);
    gen.generator(parseFloat(req.query.NE_lat), parseFloat(req.query.NE_lng), parseFloat(req.query.SW_lat), parseFloat(req.query.SW_lng), function(msg) {
        console.log("generator done");
        msg = gp.generatedPoints;
        sel.selector(msg, req.query.type, req.query.name, function(vehicles) {
            console.log("selector done");
            pat.pathFinder(vehicles, msg, req.query.type, function(vehiclesAndPathes) {
                console.log("pathFinder done");
                let fs = require('fs');
                fs.writeFile('../vehiclesAndPathes', vehiclesAndPathes, function (err) {
                    if (err) return console.log(err);
                    console.log('Wrote result in file, just check it');
                });
                stockor.stockor(vehiclesAndPathes, function(statuscode) {
                    if (statuscode/100 === 2) {
                        console.log("stockor done");
                        creator.creator(req.query.name, req.query.location, req.query.type, function() {
                            console.log("creator done");
                            creator.choice(function(grid) {
                                console.log("choice done");
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
        console.log("choice done");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(grid);
    });
});

let gettor = require('./gettor.js');
app.get('/choice', function(req, res) {
    gettor.gettor(req.query.name, function(entities) {
        console.log("gettor done");
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
