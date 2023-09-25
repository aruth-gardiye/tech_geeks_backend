
# Helper Workflow

## Expected:

1. Auto complete address search
   - Need to provide address
   - Returns array of address suggestions including address, longitude, and latitude

2. Get coordinates from address
    - Need to provide address
    - Returns longitude and latitude

3. Get address from coordinates
    - Need to provide longitude and latitude
    - Returns address


## Constraints

- Address must be valid
- Longitude and latitude must be valid


# Helper API Documentation

## Auto Complete Address Search

**Route**: `/api/Helper/addressSearch`

**HTTP Method**: `GET`

### Description

Get an array of address suggestions based on the specified address.

### Request Parameters

The request parameters should contain the following required fields:

- `address` (string): The address to search for.

#### Example Request URL

```http

GET http://localhost:3001/api/Helper/getSearchResults/?address=18 Seaview

```

## Get Coordinates from Address

**Route**: `/api/Helper/getCoordinates`

**HTTP Method**: `GET`

### Description

Get the longitude and latitude of the specified address.

### Request Parameters

The request parameters should contain the following required fields:

- `address` (string): The address to get the coordinates of.

#### Example Request URL

```http
http://localhost:3001/api/Helper/getCordsFromAddress/?address=20 Seaview Street, Byron Bay
```

## Get Address from Coordinates

**Route**: `/api/Helper/getAddress`

**HTTP Method**: `GET`

### Description

Get the address of the specified longitude and latitude.

### Request Parameters

The request parameters should contain the following required fields:

- `longitude` (number): The longitude of the address.
- `latitude` (number): The latitude of the address.

#### Example Request URL

```http
http://localhost:3001/api/Helper/getAddressfromCords/?longitude=153.616961&latitude=-28.652513
```