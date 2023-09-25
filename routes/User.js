// Routes for User schema operations
// Path: routes/User.js

const express = require('express');
const router = express.Router();

const {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserDetails,
  loginUser
} = require('../controllers/User');

/*############### Create a new user ##############*/

/*
Create a new user
Request body: user details
Required fields: username, email, password, accType
Optional fields: firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified
Example: http://localhost:3001/api/User/createUser
Body: 
  {
    "username": "johndoeclient",
    "password": "password",
    "email": "johndoe@gmail",
    "accType": "client",
    "firstName": "John",
    "lastName": "Doe",
    "tel": "0412345678",
    "location": [
      {
        "address": "20 Seaview Street, Byron Bay",
        "longitude": 153.616961,
        "latitude": -28.652513
      }
    ]
  }
*/

router.post('/createUser', createUser);


/*############### Update a user ##############*/

/*
Update a specific user
Request body: fields to update
Required fields: userId
Optional fields: username, email, password, accType, firstName, lastName, tel, location, serviceLevel, avatar, onBoarded, verified
Example: http://localhost:3001/api/User/updateUser
Body:
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
  "username": "johndoeclient",
  "password": "password",
  "email": "johndoe@gmail",
  "accType": "client",
  "firstName": "John",
  "lastName": "Doe",
  "tel": "0412345678",
  "location": [
    {
      "address": "20 Seaview Street, Byron Bay",
      "longitude": 153.616961,
      "latitude": -28.652513
    }
  ]
  "serviceLevel": 1,
  "avatar": "5d2a3c4d5f6a7b8c9d0e1f2",
  "onBoarded": true,
  "verified": true
}
*/

router.patch('/updateUser', updateUser);

/*############### Delete a user ##############*/

/*
Delete a specific user
Request Body: userId
Required fields: userId
Example: http://localhost:3001/api/User/deleteUser
Body:
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
*/

router.delete('/deleteUser', deleteUser);


/*############### Get all users ##############*/

/*
Get all users
Request params: none
Required params: none
Example: http://localhost:3001/api/User/getUsers
*/

router.get('/getUsers', getUsers);


/*############### Get user details by userId OR username OR email ##############*/

/*
Get user details by userId OR username OR email
Request params: userId OR username OR email
Required params: userId OR username OR email
Example: 
  http://localhost:3001/api/User/getUserDetails/userId/5f9f4f8c8f5c9a3c3c7c1b0b
  http://localhost:3001/api/User/getUserDetails/username/johndoeclient
  http://localhost:3001/api/User/getUserDetails/email/johndoe@gmail
*/

router.get('/getUserDetails/userId/:userId', getUserDetails);
router.get('/getUserDetails/username/:username', getUserDetails);
router.get('/getUserDetails/email/:email', getUserDetails);


/*############### Login user ##############*/

/*
Login user
Request body: username or email, password
Required fields: username or email, password
Example: http://localhost:3001/api/User/loginUser
Body:
{
  "username": "johndoeclient",
  "password": "password",
}
*/
router.post('/login', loginUser);

module.exports = router;