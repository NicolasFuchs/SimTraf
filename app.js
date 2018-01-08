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

app.get('/loca', function (req, res) {
    gen.generator('loca', parseFloat(req.query.NE_lat), parseFloat(req.query.NE_lng), parseFloat(req.query.SW_lat), parseFloat(req.query.SW_lng), function(msg) {
        sel.selector(msg, req.query.scena, function(vehicles) {
            pat.pathFinder(vehicles, msg, req.query.scena, function(vehiclesAndPathes) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                console.log(vehiclesAndPathes);
                res.send(vehiclesAndPathes);
            });
        });
    });
});
app.get('/zoom', function (req, res) {
    gen.generator('zoom', parseFloat(req.query.NE_lat), parseFloat(req.query.NE_lng), parseFloat(req.query.SW_lat), parseFloat(req.query.SW_lng), function(msg) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(msg);
    });
});
app.get('/drag', function (req, res) {
    gen.generator('drag', parseFloat(req.query.NE_lat), parseFloat(req.query.NE_lng), parseFloat(req.query.SW_lat), parseFloat(req.query.SW_lng), function(msg) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(msg);
    });
});
let creator = require('./creator.js');
let stockor = require('./stockor.js');
app.get('/creation', function(req, res) {
    console.log("NE_lat : " + req.query.NE_lat);
    console.log("NE_lng : " + req.query.NE_lng);
    console.log("SW_lat : " + req.query.SW_lat);
    console.log("SW_lng : " + req.query.SW_lng);
    gen.generator('drag', parseFloat(req.query.NE_lat), parseFloat(req.query.NE_lng), parseFloat(req.query.SW_lat), parseFloat(req.query.SW_lng), function(msg) {
        console.log("generator response : " + msg);
        console.log("generator done");
        sel.selector(msg, req.query.type, function(vehicles) {
            console.log("selector response : " + vehicles);
            console.log("selector done");
            pat.pathFinder(vehicles, msg, req.query.type, function(vehiclesAndPathes) {
                console.log("pathFinder response : " + vehiclesAndPathes);
                console.log("pathFinder done");
                stockor.stockor(vehiclesAndPathes, function(statuscode) {
                    console.log("stockor response : " + statuscode)
                    console.log("stockor done");
                    if (statuscode/100 === 2) {
                        creator.creator(req.query.name, req.query.location, req.query.type, function() {
                            console.log("creator done");
                            res.header("Access-Control-Allow-Origin", "*");
                            res.header("Access-Control-Allow-Headers", "X-Requested-With");
                            res.send("Illll essst! dixxx heureeeessss! Vinnnnn Piennnnn!");
                        });
                    }
                });
            });
        });
    });
});
app.get('/choice', function(req, res) {
    creator.choice(function(choices){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(choices);
    });
});
app.get('/tunnel', function(req, res) {
    console.log("Tunnel working!");
    res.send('Los Angeles');
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
