let createError = require('http-errors');
let express = require('express');
const http = require('http');
const socketIO = require('socket.io');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require("cors");

// MongoDB related setups
let mongoose = require("mongoose");
let bodyParser = require('body-parser')

const axios = require("axios");

let usersRouter = require('./routes/users');
const config = require('./config/config.js')
const dbUrl = config.URL_DB;

// soket
const quizGameSocket = require('./socket/locationSocket/location')
// our localhost port
// const port = 4001

const port = process.env.PORT || 4001;

let app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

// Static files directory
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", `${config.FE_Domain}`); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// our server instance
const server = http.createServer(app)


// This creates our socket using the instance of the server
// const io = socketIO.listen(server,{
//   pingInterval: 10000,
//   pingTimeout: 5000,
//   cookie: false
// })

const io = require('socket.io')(server,{
  pingInterval: 10000,
  pingTimeout: 12000,
  origins: '*:*',
  transports: ['websocket', 'flashsocket', 'htmlfile','xhr-polling','json-polling']
});
// io.set('match origin protocol', true);
// io.set('origins', '*:*');
console.log(io)
mongoose.connect(dbUrl, (err) => {
  console.log("mongodb connected", err);
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// register route
app.use('/users', usersRouter);


// Load react app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', socket => {
  quizGameSocket.quizGameSocket(socket, io)
});

server.listen(port, () => console.log(`Listening on port ${port}`))

module.exports = app;

