/*
 * @Author: Bunny
 * @Date: 2022-01-02 21:18:54
 * @FilePath: \node-project\tuzi-chat-nodejs\app.js
 */
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require('mongoose');
const socketIo = require("socket.io");
const session = require('express-session');

const hbs = require('hbs');
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();


mongoose.connect('mongodb://localhost/tuzi');

app.engine('html',hbs.__express)
// view engine setup
app.set("views", path.join(__dirname, "views"));
//set html
app.set('view engine','html');

app.use(session({ 
  name: 'tuzi-chat-nodejs', //cookie name，connect.sid
  secret: '08f8e0260c64418510cefb2b06eee5cd08f8e0260c64418510cefb2b06eee5cd', // random 128
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000, httpOnly: true }
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "static")));

let whiteList = [
  '/',
  '/login',
  '/register',
  '/error',
  '/401',
  '/404',
]

// login or not
app.use((req, res, next) => {
  const { username, userid } = req.session
  if (userid || whiteList.includes(req.url)) {
    next()
    return
  }
  res.redirect('/login')
})

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// websocketio
const scoketObj = {
  //online user
  onlineUsers: {}
};

app.mySetScoket = (server) => {
  console.log('create Scoket')
  scoketObj.scoketIO = socketIo(server, {
    cors: {
      methods: ["GET", "POST"],
    },
  });
  app.scoketObj = scoketObj
  const { scoketIO, onlineUsers } = scoketObj
  global.scoketObj = scoketObj
  scoketIO.on('connection', function (socket) {
    console.log('webscoket link successful')
    // send link
    socket.emit('open', {});
    socket.on('login', function (obj) {
      if (!onlineUsers[obj.userid]) {
        onlineUsers[obj.userid] = obj
        socket['userid'] = obj.userid
      }
      
      //Announce the arrival of someone
      socket.broadcast.emit('broad_enter', obj);
    });
    socket.on('ping', function (obj) {
      socket.emit('ping', { time: new Date().getTime() })
    });
    // Disconnect
    socket.on('disconnect', function () {
      console.log('Disconnect', socket.userid)
      if (onlineUsers[socket.userid]) {
        delete onlineUsers[socket.userid];
        //Announce the leave of someone
        socket.broadcast.emit('broad_leave', { userid: socket.userid });
      }
    });
    //Client Shutdown
    socket.on('close', function (event) {
      if (onlineUsers[event.userid]) {
        delete onlineUsers[socket.userid];
       //Announce the leave of someone
        socket.broadcast.emit('broad_leave', { userid: event.userid });
      }
    });
    // socket.broadcast.emit('hi');
    socket.on('sendMsg', function (data) {
      console.log('message', data)
      //Announce the leave of someone
      socket.broadcast.emit('message', data);
    })
  });
};

module.exports = app;
