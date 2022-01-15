/*
 * @Author: Bunny
 * @Date: 2022-01-01 21:18:54
 * @FilePath: \tuzi-chat-nodejs\routes\users.js
 */
const express = require('express');
const router = express.Router();
const user = require('../models/user').user
const md5 = require('md5-node');

router.get('/', async function(req, res) {
  const { userid } = req.session
  let uitem = await user.findOne({ _id: userid }).exec()
  res.render('user_center', uitem)
});

router.get('/info', async function(req, res) {
  const { userid } = req.session
  let uitem = await user.findOne({ _id: userid }).exec()
  res.render('user_info', uitem)
});

router.get('/chat', async function(req, res) {
  const { userid } = req.session
  let uitem = await user.findOne({ _id: userid }).exec()
  res.render('chat_room', uitem)
});

router.post('/modify_user', async function(req, res) {
  const { userid } = req.session
  const { body } = req
  let param = {}
  if(body.nickname) {
    param['nickname'] = body.nickname
  }
  if(body.email) {
    param['email'] = body.email
  }
  if(body.password) {
    param['password'] = md5(body.password)
  }
  await user.updateOne({ _id: userid }, param).exec()
  let uitem = await user.findOne({ _id: userid }).exec()
  res.render('user_info', uitem)
});

// Get all user

router.get('/online', async (req, res) => {
  const { onlineUsers } = global.scoketObj
  let users = []
  users = Reflect.ownKeys(onlineUsers)
    .map(e => ({ userid: onlineUsers[e].userid, nickname: onlineUsers[e].nickname }))
  
  let ojb = {
    count: users.length,
    list: users
  }
  res.send(ojb)
})

module.exports = router;
