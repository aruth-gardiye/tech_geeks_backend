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
Example: https://techgeeksprotobackend.azurewebsites.net/api/Helper/getCordsFromAddress/?address=20 Seaview Street, Byron Bay
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
Example: https://techgeeksprotobackend.azurewebsites.net/api/Helper/getAddressfromCords/?longitude=153.616961&latitude=-28.652513
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
Example: https://techgeeksprotobackend.azurewebsites.net/api/Helper/getSearchResults/?address=20 Seaview Street, Byron Bay
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


/*############### Display available routes in Helper ##############*/

/*
Display available routes in Helper
*/

router.get('/', (req, res) => {
    const url = new URL(req.originalUrl, `${req.headers['x-forwarded-proto']}://${req.headers.host}`);
    const baseUrl = `${req.protocol}://${req.hostname}${url.port ? `:${url.port}` : ''}${req.baseUrl}`;
    const available_routes = [
        {
            path: '/getCordsFromAddress',
            method: 'GET',
            description: 'Get coordinates from address',
            requiredParams: ['address'],
            example: {
                url: `${baseUrl}/getCordsFromAddress/?address=20 Seaview Street, Byron Bay`
            }
        },
        {
            path: '/getAddressfromCords',
            method: 'GET',
            description: 'Get address from coordinates',
            requiredParams: ['longitude', 'latitude'],
            example: {
                url: `${baseUrl}/getAddressfromCords/?longitude=153.616961&latitude=-28.652513`
            }
        },
        {
            path: '/getSearchResults',
            method: 'GET',
            description: 'Get search results from address',
            requiredParams: ['address'],
            example: {
                url: `${baseUrl}/getSearchResults/?address=20 Seaview Street, Byron Bay`
            }
        }
    ];

    const formatted_routes = available_routes.map(route => {
      const requiredParams = route.requiredParams ? `Required fields: ${route.requiredParams.join(', ')}` : '';
      const example = route.example ? `Example: ${JSON.stringify(route.example, null, 2)}` : '';
      const divider = `\n#############################################\n`
  
      return `${divider}Endpoint: ${route.path}\nUsage: ${route.description}\nMethod: ${route.method}\n${requiredParams}\n${example ? example : ''}\n`;
    }).join('\n');
  
    res.set('Content-Type', 'text/plain');
    res.status(200).send(`API endpoints for Helper\n${formatted_routes}`);
});

module.exports = router;