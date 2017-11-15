let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let app = express();
let gen = require('./generator.js');

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
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(msg);
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
