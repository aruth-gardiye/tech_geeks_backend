const mongoose = require('mongoose');
const httpStatus = require('http-status');
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

  // if serviceNames is provided, delete duplicates if any
  if (req.body.serviceNames) {
    req.body.serviceNames = [...new Set(req.body.serviceNames)];
  }

  const user = new User({
    username: req.body.username,
    password: null,
    email: req.body.email,
    accType: req.body.accType,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    tel: req.body.tel,
    location: req.body.location,
    serviceNames: req.body.serviceNames || [],
    avatar: req.body.avatar || null,
    onBoarded: req.body.onBoarded || false,
    verified: req.body.verified || false
  });

  // hash password
  user.password = user.generateHash(req.body.password);

  user.save()
    .then(result => {
      const { _id, username, accType, name, email } = result; // extract only the non-sensitive information
      res.status(httpStatus.CREATED).json({
        message: 'User created',
        user: { _id, username, accType, name, email }
      });
    })
    .catch(err => {
      console.log(err);
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

    // if serviceNames is provided, delete duplicates if any
    if (updateBody.serviceNames) {
      updateBody.serviceNames = updateBody.serviceNames.filter((service, index, self) =>
        index === self.findIndex((s) => s.serviceName === service.serviceName)
      );
    }

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

// get user details
// Usecase: get user details by userId, username, or email
// Required: userId OR username OR email

const getUserDetails = async (req, res) => {
  try {
    let user;
    if (req.params.userId) {
      user = await User.findById(req.params.userId);
    } else if (req.params.username) {
      user = await User.findOne({ username: req.params.username });
    } else if (req.params.email) {
      user = await User.findOne({ email: req.params.email });
    }

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    const { _id, username, email, accType, firstName, lastName, tel, location, serviceNames, avatar, onBoarded, verified } = user;
    return res.status(httpStatus.OK).json({
      user: { _id, username, email, accType, firstName, lastName, tel, location, serviceNames, avatar, onBoarded, verified }
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
      const { _id, username, email, accType, firstName, lastName, tel, location, serviceNames, avatar, onBoarded, verified } = user;
      return { _id, username, email, accType, firstName, lastName, tel, location, serviceNames, avatar, onBoarded, verified };
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

// login user
// Request body: username, password

const loginUser = async (req, res) => {
  try {
    // validate POST body with user validation schema
    const { error } = User.validateUserLogin(req.body);

    if (error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: error.details[0].message
      });
    }

    // check if email or username exists in the request body
    if (!req.body.username && !req.body.email) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Username or email is required'
      });
    }

    // check if user exists
    const user = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // check if password is valid
    if (!user.validPassword(req.body.password)) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'Invalid password'
      });
    }

    // remove sensitive information and return only non-sensitive information
    const { _id, username, email, accType, firstName, lastName, tel, location, serviceNames, avatar, onBoarded, verified } = user;

    return res.status(httpStatus.OK).json({
      message: 'Login successful',
      user: { _id, username, email, accType, firstName, lastName, tel, location, serviceNames, avatar, onBoarded, verified }
    });
  }
  catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
}

// check if username exists
// Request query: username

const checkUsername = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Username is required'
      });
    }

    return res.status(httpStatus.OK).json({
      message: 'Username is available'
    });
  }
  catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
}

// check if email exists
// Request query: email

const checkEmail = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Email is required'
      });
    }

    return res.status(httpStatus.OK).json({
      message: 'Email is available'
    });
  }
  catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
}

// make user onboarding complete
// Request body: userId

const onBoardUser = async (req, res) => {
  try {
    // check if object id is valid if then convert to object id
    if (!mongoose.isValidObjectId(req.body.userId)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid user id'
      });
    }

    const id = new mongoose.Types.ObjectId(req.body.userId);

    // check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // update 'onBoarded' field to true
    user.onBoarded = true;

    // save user
    await user.save();

    return res.status(httpStatus.OK).json({
      message: 'User onboarding complete'
    });
  }

  catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });
  }
}

// make user verification complete
// Request body: userId

const verifyUser = async (req, res) => {
  try {
    // check if object id is valid if then convert to object id
    if (!mongoose.isValidObjectId(req.body.userId)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid user id'
      });
    }

    const id = new mongoose.Types.ObjectId(req.body.userId);

    // check if user exists
    const user = await User.findById(id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // update 'verified' field to true
    user.verified = true;

    // save user
    await user.save();

    return res.status(httpStatus.OK).json({
      message: 'User verification complete'
    });
  }

  catch (error) {
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
  getUserDetails,
  loginUser,
  checkUsername,
  checkEmail,
  onBoardUser,
  verifyUser
};