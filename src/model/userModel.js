const { Schema, model } = require("mongoose");
// const isEmail = require('validator')
const { hash, compare } = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
},{timestamps:true,versionKey:false});

userSchema.pre('save',async function(next){
    this.password =  await hash(this.password,10)
    next()
})

userSchema.methods.comparePassword = function (password) {
  return compare(password, this.password);
};

module.exports = userModel = model("user", userSchema);
