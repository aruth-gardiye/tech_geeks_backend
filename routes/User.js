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
  loginUser,
  onBoardUser,
  verifyUser,
} = require('../controllers/User');

/*############### Create a new user ##############*/

/*
Create a new user
Request body: user details
Required fields: 
  username, email, password
  , accType (valid values: client, provider, admin, support)
Optional fields: 
  firstName, lastName, tel, location
  , serviceLevel (valid values: 1, 2, 3, 4, null, '')
  , avatar, onBoarded, verified

Example: https://techgeeksprotobackend.azurewebsites.net/api/User/createUser

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
Optional fields: 
  username, email, password
  , accType (valid values: client, provider, admin, support)
  , firstName, lastName, tel, location
  , serviceLevel (valid values: 1, 2, 3, 4, null, '')
  , avatar, onBoarded, verified

Example: https://techgeeksprotobackend.azurewebsites.net/api/User/updateUser

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
Example: https://techgeeksprotobackend.azurewebsites.net/api/User/deleteUser
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
Example: https://techgeeksprotobackend.azurewebsites.net/api/User/getUsers
*/

router.get('/getUsers', getUsers);


/*############### Get user details by userId OR username OR email ##############*/

/*
Get user details by userId OR username OR email
Request params: userId OR username OR email
Required params: userId OR username OR email
Example: 
  https://techgeeksprotobackend.azurewebsites.net/api/User/getUserDetails/userId/5f9f4f8c8f5c9a3c3c7c1b0b
  https://techgeeksprotobackend.azurewebsites.net/api/User/getUserDetails/username/johndoeclient
  https://techgeeksprotobackend.azurewebsites.net/api/User/getUserDetails/email/johndoe@gmail
*/

router.get('/getUserDetails/userId/:userId', getUserDetails);
router.get('/getUserDetails/username/:username', getUserDetails);
router.get('/getUserDetails/email/:email', getUserDetails);


/*############### Login user ##############*/

/*
Login user
Request body: username or email, password
Required fields: username or email, password
Example: https://techgeeksprotobackend.azurewebsites.net/api/User/loginUser
Body:
{
  "username": "johndoeclient",
  "password": "password",
}
*/
router.post('/login', loginUser);


/*############### Onboard user ##############*/

/*
Onboard user
Request body: userId
Required fields: userId
Example: https://techgeeksprotobackend.azurewebsites.net/api/User/onBoardUser
Body:
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
*/

router.patch('/onBoardUser', onBoardUser);


/*############### Verify user ##############*/

/*
Verify user
Request body: userId
Required fields: userId
Example: https://techgeeksprotobackend.azurewebsites.net/api/User/verifyUser
Body:
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
*/

router.patch('/verifyUser', verifyUser);


/*############### Display available routes in User ##############*/

/*
Display available routes in User
*/

router.get('/', (req, res) => {
  const url = new URL(req.originalUrl, `${req.headers['x-forwarded-proto']}://${req.headers.host}`);
  const baseUrl = `${req.protocol}://${req.hostname}${url.port ? `:${url.port}` : ''}${req.baseUrl}`;
  const available_routes = [
    {
      path: '/createUser',
      method: 'POST',
      description: 'Create a new user',
      requiredFields: ['username', 'email', 'password', 'accType'],
      optionalFields: ['firstName', 'lastName', 'tel', 'location', 'serviceLevel', 'avatar', 'onBoarded', 'verified'],
      validValues: {
        accType: ['client', 'provider', 'admin', 'support'],
        serviceLevel: [1, 2, 3, 4, null, ''],
      },
      example: {
        url: `${baseUrl}/createUser`,
        body: {
          username: 'johndoe_client',
          password: 'password',
          email: 'johndoe@example.com',
          accType: 'client',
          firstName: 'John',
          lastName: 'Doe',
          tel: '0412345678',
          location: [
            {
              address: '20 Seaview Street, Byron Bay',
              longitude: 153.616961,
              latitude: -28.652513
            }
          ]
        }
      }
    },
    {
      path: '/updateUser',
      method: 'PATCH',
      description: 'Update a specific user',
      requiredFields: ['userId'],
      optionalFields: ['username', 'email', 'password', 'accType', 'firstName', 'lastName', 'tel', 'location', 'serviceLevel', 'avatar', 'onBoarded', 'verified'],
      validValues: {
        accType: ['client', 'provider', 'admin', 'support'],
        serviceLevel: [1, 2, 3, 4, null, ''],
      },
      example: {
        url: `${baseUrl}/updateUser`,
        body: {
          userId: '5f9f4f8c8f5c9a3c3c7c1b0b',
          username: 'johndoe_client',
          password: 'password',
          email: 'johndoe@example.com',
          accType: 'client',
          firstName: 'John',
          lastName: 'Doe',
          tel: '0412345678',
          location: [
            {
              address: '20 Seaview Street, Byron Bay',
              longitude: 153.616961,
              latitude: -28.652513
            }
          ],
          serviceLevel: 1,
          avatar: '5d2a3c4d5f6a7b8c9d0e1f2',
          onBoarded: true,
          verified: true
        }
      }
    },
    {
      path: '/deleteUser',
      method: 'DELETE',
      description: 'Delete a specific user',
      requiredFields: ['userId'],
      example: {
        url: `${baseUrl}/deleteUser`,
        body: {
          userId: '5f9f4f8c8f5c9a3c3c7c1b0b'
        }
      }
    },
    {
      path: '/getUsers',
      method: 'GET',
      description: 'Get all users',
      example: {
        url: `${baseUrl}/getUsers`
      }
    },
    {
      path: '/getUserDetails/userId/:userId',
      method: 'GET',
      description: 'Get user details by userId',
      requiredFields: ['userId'],
      example: {
        url: `${baseUrl}/getUserDetails/userId/5f9f4f8c8f5c9a3c3c7c1b0b`
      }
    },
    {
      path: '/getUserDetails/username/:username',
      method: 'GET',
      description: 'Get user details by username',
      requiredFields: ['username'],
      example: {
        url: `${baseUrl}/getUserDetails/username/johndoe_client`
      }
    },
    {
      path: '/getUserDetails/email/:email',
      method: 'GET',
      description: 'Get user details by email',
      requiredFields: ['email'],
      example: {
        url: `${baseUrl}/getUserDetails/email/johndoe@example.com`
      }
    },
    {
      path: '/login',
      method: 'POST',
      description: 'Login user',
      requiredFields: ['username or email', 'password'],
      example: {
        url: `${baseUrl}/login`,
        body: {
          username: 'johndoe_client',
          password: 'password'
        }
      }
    },
    {
      path: '/onBoardUser',
      method: 'PATCH',
      description: 'Onboard user',
      requiredFields: ['userId'],
      example: {
        url: `${baseUrl}/onBoardUser`,
        body: {
          userId: '5f9f4f8c8f5c9a3c3c7c1b0b'
        }
      }
    },
    {
      path: '/verifyUser',
      method: 'PATCH',
      description: 'Verify user',
      requiredFields: ['userId'],
      example: {
        url: `${baseUrl}/verifyUser`,
        body: {
          userId: '5f9f4f8c8f5c9a3c3c7c1b0b'
        }
      }
    }
  ];

  const formatted_routes = available_routes.map(route => {
    const requiredFields = route.requiredFields ? `Required fields: ${route.requiredFields.join(', ')}` : '';
    const optionalFields = route.optionalFields ? `Optional fields: ${route.optionalFields.join(', ')}` : '';
    const validValues = route.validValues ? `Valid values: ${JSON.stringify(route.validValues, null, 2)}` : '';
    const example = route.example ? `Example: ${JSON.stringify(route.example, null, 2)}` : '';
    const divider = `\n#############################################\n`

    return `${divider}Endpoint: ${route.path}\nUsage: ${route.description}\nMethod: ${route.method}\n${requiredFields}\n${optionalFields ? optionalFields + `\n` : ''}${validValues ? validValues + `\n` : ''}${example ? example : ''}\n`;
  }).join('\n');

  res.set('Content-Type', 'text/plain');
  res.status(200).send(`API endpoints for User\n${formatted_routes}`);
});

module.exports = router;