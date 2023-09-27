// MongoDB schema for User
// path: schemas/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const Joi = require('joi');

const userSchema = new Schema(
  {
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
      address: {
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
    serviceLevel: {
      type: String,
      required: false,
      enum: [1, 2, 3, 4, null, ''],
      default: null
    },
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
  },
  {
    retainKeyOrder: true
  });

// hash the password
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// validate user
userSchema.statics.validateUser = function (user) {
  const schema = Joi.object({
    username: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(1).required(),
    email: Joi.string().email().min(4).required(),
    accType: Joi.string().valid('admin', 'support', 'client', 'provider').default('client').required(),
    firstName: Joi.string().allow(null).allow('').optional(),
    lastName: Joi.string().allow(null).allow('').optional(),
    tel: Joi.string().allow(null).allow('').optional(),
    location: Joi.array().items(Joi.object({
      address: Joi.string().allow(null).allow('').optional(),
      longitude: Joi.number().allow(null).allow('').optional(),
      latitude: Joi.number().allow(null).allow('').optional(),
    })),
    serviceLevel: Joi.number().valid(1, 2, 3, 4, null, '').allow(null).allow('').optional(),
    avatar: Joi.string().allow(null).allow('').optional(),
    onBoarded: Joi.boolean().allow(null).allow('').optional().default(false),
    verified: Joi.boolean().allow(null).allow('').optional().default(false),
  });
  return schema.validate(user);
};

// validate user update
userSchema.statics.validateUserUpdate = function (user) {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    username: Joi.string().min(1).max(50).optional(),
    password: Joi.string().min(1).optional(),
    email: Joi.string().email().min(4).optional(),
    accType: Joi.string().valid('admin', 'support', 'client', 'provider').optional(),
    firstName: Joi.string().allow(null).allow('').optional(),
    lastName: Joi.string().allow(null).allow('').optional(),
    tel: Joi.string().allow(null).allow('').optional(),
    location: Joi.array().items(Joi.object({
      address: Joi.string().allow(null).allow('').optional(),
      longitude: Joi.number().allow(null).allow('').optional(),
      latitude: Joi.number().allow(null).allow('').optional(),
    })),
    serviceLevel: Joi.number().valid(1, 2, 3, 4, null, '').allow(null).allow('').optional(),
    avatar: Joi.string().allow(null).allow('').optional(),
    onBoarded: Joi.boolean().allow(null).allow('').optional().default(false),
    verified: Joi.boolean().allow(null).allow('').optional().default(false),
  });
  return schema.validate(user);
};

// validate user login
userSchema.statics.validateUserLogin = function (user) {
  const schema = Joi.object({
    username: Joi.string().min(1).max(50).optional(),
    email: Joi.string().email().min(4).optional(),
    password: Joi.string().min(1).required(),
  });
  return schema.validate(user);
};

module.exports = mongoose.model('User', userSchema);