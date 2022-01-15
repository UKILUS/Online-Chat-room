/*
 * @Author: Bunny
 * @Date: 2022-01-04 21:18:54
 * @FilePath: \tuzi-chat-nodejs\routes\index.js
 */
const express = require('express');
const router = express.Router();
const md5 = require('md5-node');
const user = require('../models/user').user

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', async function(req, res, next) {
  const { body } = req
  let fuser = await user.findOne({ username: body.username, password: md5(body.password) })
  if (!fuser) {
    res.render('login', { msg: 'The user name or password is incorrect' });
    return
  }
  
  req.session.username = body.username
  req.session.userid = fuser.id
  res.redirect('/users')
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.post('/register', async function(req, res, next) {
  const { body } = req
  console.log(body)
  if(body.password !== body.conpassword) {
    res.render('register', { msg: 'The two passwords are inconsistent' });
    return
  }
  let fuser = await user.findOne({ username: body.username })
  if (fuser) {
    res.render('register', { msg: 'The user name is already in use' });
    return
  }
  let dres = await user({...body, password: md5(body.password)}).save()
  if(dres) {
    console.log('Insert the success', dres)
    res.render('register', { success: 'Registered successfully' });
    return
  }
  
  res.render('register', { msg: 'Registration failed' });
});

router.get('/error', function(req, res, next) {
  res.render('error');
});

router.get('/401', function(req, res, next) {
  res.render('401');
});

router.get('/404', function(req, res, next) {
  res.render('404');
});

module.exports = router;
