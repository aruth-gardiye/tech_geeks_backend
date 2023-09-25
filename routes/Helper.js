// Routes for helper API's (forward geocoding, reverse geocoding, search results)
// Path: routes/Helper.js

const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');

const {
    forwardGeocoding,
    reverseGeocoding,
    searchResultsFromAddress
} = require('../controllers/Helper');

/*############### Get coordinates from address ##############*/

/* 
Gets coordinates from address
Required params: address
Example: http://localhost:3001/api/Helper/getCordsFromAddress/?address=20 Seaview Street, Byron Bay
*/

router.get('/getCordsFromAddress', async (req, res) => {
    const address = req.query.address;
    try {
        const coordinates = await forwardGeocoding(address);
        res.status(httpStatus.OK).json({
            coordinates
        });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: error
      });
    }
});

/*############### Get address from coordinates ##############*/

/*
Gets address from coordinates
Required params: longitude, latitude (?longitude=...&latitude=...)
Example: http://localhost:3001/api/Helper/getAddressfromCords/?longitude=153.616961&latitude=-28.652513
*/
router.get('/getAddressfromCords', async (req, res) => {
    const {longitude, latitude} = req.query;
    const coordinates = [longitude, latitude];
    try {
        const address = await reverseGeocoding(coordinates);
        res.status(httpStatus.OK).json({
            address
        });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: error
      });
    }
});

/*############### Get search results from address ##############*/

/*
Gets search results from address
Required params: address
Example: http://localhost:3001/api/Helper/getSearchResults/?address=20 Seaview Street, Byron Bay
*/
router.get('/getSearchResults', async (req, res) => {
    const address = req.query.address;
    try {
        const searchResults = await searchResultsFromAddress(address);
        res.status(httpStatus.OK).json({
            searchResults
        });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: error
      });
    }
});

module.exports = router;