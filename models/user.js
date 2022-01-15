/*
 * @Author: Bunny
 * @Date: 2022-01-02 21:18:54
 * @FilePath: \tuzi-chat-nodejs\models\users.js
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
  username: String,
  nickname: String,
  email: String,
  password: String,
});
exports.user = mongoose.model("users", userSchema);
