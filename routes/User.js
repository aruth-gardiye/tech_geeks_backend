const express = require('express');
const router = express.Router();

const {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserByUsername,
} = require('../controllers/User');

// Create a new user
// Request body: 
// Required fields: username, email, password, accType
// Optional fields: firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified
// Example: http://localhost:3001/api/User/createUser
// Body: 
  //{
  //   "username": "johndoeclient",
  //   "password": "password",
  //   "email": "johndoe@gmail",
  //   "accType": "client",
  //   "firstName": "John",
  //   "lastName": "Doe",
  //   "tel": "0412345678",
  //   "location": [
  //     {
  //       "address": "20 Seaview Street, Byron Bay",
  //       "longitude": 153.616961,
  //       "latitude": -28.652513
  //     }
  //   ]
  // }

router.post('/createUser', createUser);

// Update a specific user
// Request body: fields to update
// Required fields: userId
// Optional fields: username, email, password, accType, firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified
// Example: http://localhost:3001/api/User/updateUser
// Body:
// {
//   "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
//   "username": "johndoeclient",
//   "password": "password",
//   "email": "johndoe@gmail",
//   "accType": "client",
//   "firstName": "John",
//   "lastName": "Doe",
//   "tel": "0412345678",
//   "location": [
//     {
//       "address": "20 Seaview Street, Byron Bay",
//       "longitude": 153.616961,
//       "latitude": -28.652513
//     }
//   ]
//   "serviceLevel": 1,
//   "avatar": "5d2a3c4d5f6a7b8c9d0e1f2",
//   "onBoarded": true,
//   "verified": true
// }


router.patch('/updateUser', updateUser);

// Delete a specific user
// Request Body: userId
// Example: http://localhost:3001/api/User/deleteUser
// Body:
// {
//   "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
// }

router.delete('/deleteUser', deleteUser);

// Get all users
// Request params: none
// Example: http://localhost:3001/api/User/getUsers

router.get('/getUsers', getUsers);

// Get user details by username
// Request params: username
// Example: http://localhost:3001/api/User/getUserDetailsbyUserName/johndoeclient
router.get('/getUserDetailsbyUserName/:username', getUserByUsername);


module.exports = router;