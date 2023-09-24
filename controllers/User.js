const mongoose = require('mongoose');
const httpStatus = require('http-status');

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const bcrypt = require('bcrypt');
// const { NO_CONTENT } = require('http-status');

// const userSchema = new Schema({
//   _id: mongoose.Schema.Types.ObjectId,
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     minlength: 1,
//     maxlength: 50,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 1,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     minlength: 4,
//     trim: true
//   },
//   accType: {
//     type: String,
//     required: true,
//     enum: ['admin', 'support', 'client', 'provider'],
//     default: 'client'
//   },
//   firstName: {
//     type: String,
//     required: false,
//   },
//   lastName: {
//     type: String,
//     required: false,
//   },
//   tel: {
//     type: String,
//     required: false,
//   },
//   location: [{
//     _id: false,
//     locationName: {
//       type: String,
//       required: false,
//     },
//     longitude: {
//       type: Number,
//       required: false
//     },
//     latitude: {
//       type: Number,
//       required: false
//     }
//   }],
//   serviceLevel: {
//     type: String,
//     required: false,
//     enum: [1, 2, 3, 4],
//     default: null
//   },
//   avatar: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'File',
//     required: false
//   },
//   onBoarded: {
//     type: Boolean,
//     default: false
//   },
//   verified: {
//     type: Boolean,
//     default: false
//   },
// });

// // hash the password
// userSchema.methods.generateHash = function (password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// // checking if password is valid
// userSchema.methods.validPassword = function (password) {
//   return bcrypt.compareSync(password, this.password);
// };


// // validate user
// userSchema.statics.validateUser = function (user) {
//   const schema = Joi.object({
//     username: Joi.string().min(1).max(50).required(),
//     password: Joi.string().min(1).required(),
//     email: Joi.string().min(4).required(),
//     accType: Joi.string().valid('admin', 'support', 'client', 'provider').default('client').required(),
//     firstName: Joi.string().allow(null).allow('').optional(),
//     lastName: Joi.string().allow(null).allow('').optional(),
//     tel: Joi.string().allow(null).allow('').optional(),
//     location: Joi.array().items(Joi.object({
//       address: Joi.string().allow(null).allow('').optional(),
//       longitude: Joi.number().allow(null).allow('').optional(),
//       latitude: Joi.number().allow(null).allow('').optional(),
//     })),
//     serviceLevel: Joi.number().valid(1, 2, 3, 4).allow(null).allow('').optional(),
//     avatar: Joi.string().allow(null).allow('').optional(),
//     onBoarded: Joi.boolean().allow(null).allow('').optional().default(false),
//     verified: Joi.boolean().allow(null).allow('').optional().default(false),
//   });
//   return schema.validate(user);
// };



// validate user update
// userSchema.statics.validateUserUpdate = function (user) {
//   const schema = Joi.object({
//     userId: Joi.string().hex().length(24).required(),
//     username: Joi.string().min(1).max(50).optional(),
//     password: Joi.string().min(1).optional(),
//     email: Joi.string().min(4).optional(),
//     accType: Joi.string().valid('admin', 'support', 'client', 'provider').optional(),
//     firstName: Joi.string().allow(null).allow('').optional(),
//     lastName: Joi.string().allow(null).allow('').optional(),
//     tel: Joi.string().allow(null).allow('').optional(),
//     location: Joi.array().items(Joi.object({
//       address: Joi.string().allow(null).allow('').optional(),
//       longitude: Joi.number().allow(null).allow('').optional(),
//       latitude: Joi.number().allow(null).allow('').optional(),
//     })),
//     serviceLevel: Joi.number().valid(1, 2, 3, 4).allow(null).allow('').optional(),
//     avatar: Joi.string().allow(null).allow('').optional(),
//     onBoarded: Joi.boolean().allow(null).allow('').optional().default(false),
//     verified: Joi.boolean().allow(null).allow('').optional().default(false),
//   });
//   return schema.validate(user);
// };

// module.exports = mongoose.model('User', userSchema);


const User = require('../schemas/User');

// Create a new user
// Request body: username, password, email, accType, firstName, lastName, tel, location

const createUser = async (req, res) => {

  // validate POST body with user validation schema
  const { error } = User.validateUser(req.body);
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.details[0].message
    });
  }

  // check if username or email already exists
  const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
  if (existingUser) {
    return res.status(httpStatus.CONFLICT).json({
      message: 'Username or email already exists'
    });
  }

  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    accType: req.body.accType,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    tel: req.body.tel,
    location: req.body.location
  });

  user.save()
    .then(result => {
      const { _id, username, accType, name, email } = result; // extract only the non-sensitive information
      res.status(httpStatus.CREATED).json({
        message: 'User created',
        user: { _id, username, accType, name, email }
      });
    })
    .catch(err => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: err
      });
    });
}

// update user
// Request body: userID (required), Optional: username, password, email, accType, etc.

const updateUser = async (req, res) => {
  try {
    const { error } = User.validateUserUpdate(req.body);
    if (error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: error.details[0].message
      });
    }

    // check if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
    if (existingUser && existingUser._id.toString() !== req.body.userId) {
      return res.status(httpStatus.CONFLICT).json({
        message: 'Username or email already exists'
      });
    }

    // remove userId from req.body
    const { userId, ...updateBody } = req.body;

    // update user
    const update = await User.findOneAndUpdate(
      { _id: userId },
      {
        ...updateBody
      },
    );

    if (!update) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error updating user'
      });
    }

    if (updateBody.password) {
      update.password = user.generateHash(updateBody.password);
      await update.save();
    }

    return res.status(httpStatus.OK).json({
      message: 'User updated'
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
};

// delete user
// Request body: userID (required)

const deleteUser = async (req, res) => {
  try {
    // check if object id is valid if then convert to object id
    if (!mongoose.isValidObjectId(req.body.userId)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid user id'
      });
    } 
    
    const id = new mongoose.Types.ObjectId(req.body.userId);

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    const deleteUser = await User.findOneAndDelete({ _id: id });

    if (!deleteUser) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error deleting user'
      });
    }

    return res.status(httpStatus.OK).json({
      message: 'User deleted'
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
}

// get user details by username
// Request params: username

const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }
    const { _id, username, email, accType, firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified } = user;
    return res.status(httpStatus.OK).json({
      user: { _id, username, email, accType, firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified }
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
};

// get list of users
// Request params: none

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'No users found'
      });
    }
    // remove sensitive information and return only non-sensitive information
    const usersList = users.map(user => {
      const { _id, username, email, accType, firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified } = user;
      return { _id, username, email, accType, firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified };
    });
    return res.status(httpStatus.OK).json({
      users: usersList
    });

  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserByUsername
};