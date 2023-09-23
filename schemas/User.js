// MongoDB schema for User
// path: schemas/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 50,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    trim: true
  },
  accType: {
    type: String,
    required: true,
    enum: ['admin', 'support', 'client', 'provider'],
    default: 'client'
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  tel: {
    type: String,
    required: false,
  },
  location: [{
    _id: false,
    locationName: {
      type: String,
      required: false,
    },
    longitude: {
      type: Number,
      required: false
    },
    latitude: {
      type: Number,
      required: false
    }
  }],
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: false
  },
  onBoarded: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
});

// hash the password
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);