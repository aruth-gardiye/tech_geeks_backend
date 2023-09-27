
# User Workflow

## Expected:

1. User sign up
  - Need to provide username, password, email, accType, firstName, lastName, and location
  - accType can be 'client' or 'provider'
  - Can pass in additional fields such as tel, avatar, serviceLevel, onboarded, verified, etc.

2. User sign in
  - Need to provide username or email, and password
  - If successful, returns everything except password in user object in response body

3. Update user profile
  - Can update any fields except _id
  - If successful, returns everything except password in user object in response body


## Constraints

- Username must be unique
- Email must be unique
- Password must be at least 1 character long
- Location must include address and coordinates (can use helper APIs to get coordinates from address search)


# User API Documentation

## Create a New User

**Route**: `/api/User/createUser`

**HTTP Method**: `POST`

### Description

Create a new user with the specified user details.

### Request Body

The request body should contain the following required fields:

- `username` (string): The username of the user.
- `password` (string): The user's password.
- `email` (string): The user's email address.
- `accType` (string): The account type of the user (valid values are `client` or `provider`, can be extended to include `admin` or `support` as well).
- `firstName` (string): The user's first name.
- `lastName` (string): The user's last name.
- `location` (array of objects): The user's location, which includes an address, longitude, and latitude.

Additionally, you can include the optional fields:

- `tel` (string): The user's telephone number.
- `serviceLevel` (string): The user's service level (valid values are ``, `1`, `2`, `3`, or `4`).
- `avatar` (string): The user's avatar image _id.
- `onBoarded` (boolean): Whether the user has completed onboarding.
- `verified` (boolean): Whether the user's account is verified.

#### Example Request Body

```json
{
  "username": "janedoe_provider",
  "password": "password",
  "email": "janedoe@example.com",
  "accType": "provider",
  "firstName": "Jane",
  "lastName": "Doe",
  "tel": "0412345678",
  "location": [
    {
      "address": "20 Seaview Street, Byron Bay",
      "longitude": 153.616961,
      "latitude": -28.652513
    }
  ],
  "serviceLevel": "2"
}
```

## Update a User

**Route**: `/api/User/updateUser`

**HTTP Method**: `PATCH`

### Description

Update specific fields of a user identified by their unique user ID.

### Request Body

The request body should contain the following required field:

- `userId` (string): The ID of the user you want to update.

Additionally, you can include the optional fields to update:

- `username` (string): The updated username of the user.
- `password` (string): The updated password of the user.
- `email` (string): The updated email address of the user.
- `accType` (string): The updated account type of the user (valid values are `client` or `provider`, can be extended to include `admin` or `support` as well).
- `firstName` (string): The updated first name of the user.
- `lastName` (string): The updated last name of the user.
- `tel` (string): The updated telephone number of the user.
- `location` (array of objects): The updated location information of the user, which includes an address, longitude, and latitude.
- `serviceLevel` (integer): The updated service level of the user (valid values are ``, `1`, `2`, `3`, or `4`).
- `avatar` (string): The updated avatar image _id of the user.
- `onBoarded` (boolean): Whether the user has completed onboarding (optional).
- `verified` (boolean): Whether the user's account is verified (optional).

#### Example Request Body

```json
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
  "username": "johndoe_client",
  "password": "password",
  "email": "johndoe@example.com",
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
  ],
  "avatar": "5d2a3c4d5f6a7b8c9d0e1f2",
  "verified": true
}
```

## Delete a User

**Route**: `/api/User/deleteUser`

**HTTP Method**: `DELETE`

### Description

Delete a specific user identified by their unique user ID.

### Request Body

The request body should contain the following required field:

- `userId` (string): The ID of the user you want to delete.

#### Example Request Body

```json
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
```

## Get User Details by userId, username, or email

**Route**: 
- `/api/User/getUserDetails/userId/:userId`
- `/api/User/getUserDetails/username/:username`
- `/api/User/getUserDetails/email/:email`

**HTTP Method**: `GET`

### Description

Retrieve user details by specifying either the user's userId, username, or email address.

### Request Parameters

The request URL should include one of the following required parameters:

- `userId` (string): The ID of the user you want to retrieve.
- `username` (string): The username of the user you want to retrieve.
- `email` (string): The email address of the user you want to retrieve.

#### Example Request URLs

```http
GET http://localhost:3001/api/User/getUserDetails/userId/5f9f4f8c8f5c9a3c3c7c1b0b
GET http://localhost:3001/api/User/getUserDetails/username/johndoeclient
GET http://localhost:3001/api/User/getUserDetails/email/johndoe@gmail
```

## Login User

**Route**: `/api/User/login`

**HTTP Method**: `POST`

### Description

Authenticate and log in a user by providing either their username or email and password.

### Request Body

The request body should contain the following required fields:

- `username` (string): The username or email address of the user.
- `password` (string): The user's password.

#### Example Request Body

```json
{
  "username": "johndoeclient",
  "password": "password"
}
```

## Onboard User

**Route**: `/api/User/onBoardUser`

**HTTP Method**: `PATCH`

### Description

Update the onboarding status of a user identified by their unique user ID.

### Request Body

The request body should contain the following required fields:

- `userId` (string): The ID of the user you want to update.

### Example Request Body

```json
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
```

## Verify User

**Route**: `/api/User/verifyUser`

**HTTP Method**: `PATCH`

### Description

Update the verification status of a user identified by their unique user ID.

### Request Body

The request body should contain the following required fields:

- `userId` (string): The ID of the user you want to update.

### Example Request Body

```json
{
  "userId": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
```

