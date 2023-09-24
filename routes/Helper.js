// // Helper functions for the controllers
// // Path: controllers/Helper.js

// // Forward Geocoding Address to Coordinates using Mapbox API
// // https://docs.mapbox.com/api/search/#forward-geocoding

// dotenv = require('dotenv');
// const axios = require('axios');
// const httpStatus = require('http-status');

// const forwardGeocoding = async (address) => {
//   try {
//     const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=au&access_token=${process.env.MAPBOX_TOKEN}`);
//     if (response.data.features.length === 0) {
//       const error = new Error('Address not found');
//       error.status = httpStatus.NOT_FOUND;
//       throw error;
//     }
//     const coordinates = response.data.features[0].geometry.coordinates;
//     return coordinates;
//   } catch (error) {
//     throw error;
//   }
// }

// // Reverse Geocoding Coordinates to Address using Mapbox API
// // https://docs.mapbox.com/api/search/#reverse-geocoding

// const reverseGeocoding = async (coordinates) => {
//   try {
//     const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?country=au&access_token=${process.env.MAPBOX_TOKEN}`);
//     if (response.data.features.length === 0) {
//       const error = new Error('Address not found');
//       error.status = httpStatus.NOT_FOUND;
//       throw error;
//     }
//     const address = response.data.features[0].place_name;
//     return address;
//   } catch (error) {
//     throw error;
//   }
// }

// const searchResultsFromAddress = async (address) => {
//   try {
//     const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=au&access_token=${process.env.MAPBOX_TOKEN}`);
//     if (response.data.features.length === 0) {
//       const error = new Error('Address not found');
//       error.status = httpStatus.NOT_FOUND;
//       throw error;
//     }

//     // array of addresses and their coordinates
//     const searchResults = response.data.features.map((feature) => {
//       return {
//         address: feature.place_name,
//         coordinates: feature.geometry.coordinates
//       }
//     });
//     return searchResults;

//   } catch (error) {
//     throw error;
//   }
// }

// module.exports = {
//   forwardGeocoding,
//   reverseGeocoding,
//   searchResultsFromAddress
// };

const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');

const {
    forwardGeocoding,
    reverseGeocoding,
    searchResultsFromAddress
} = require('../controllers/Helper');

// Gets coordinates from address
// Request params: address
// Example: http://localhost:3001/api/Helper/getCordsFromAddress/?address=20 Seaview Street, Byron Bay
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

// Gets address from coordinates
// Request params: longitude, latitude (?longitude=...&latitude=...)
// Example: http://localhost:3001/api/Helper/getAddressfromCords/?longitude=153.616961&latitude=-28.652513
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

// Gets search results from address
// Request params: address
// Example: http://localhost:3001/api/Helper/getSearchResults/?address=20 Seaview Street, Byron Bay
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