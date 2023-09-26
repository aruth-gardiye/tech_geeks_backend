// Routes for Job schema operations
// Path: routes/Job.js

const express = require('express');
const router = express.Router();

const {
  createJob,
  updateJob,
  submitBid,
  updateBid,
  getAllJobsByClient,
  getAllJobsByServiceProvider,
  getAllJobs,
  getJobById,
  deleteJob
} = require('../controllers/Job');

/*############### Create a new job ##############*/

/* 
Required fields: jobName, jobDescription, jobType, jobLocation, jobStartDate, jobEndDate, jobStatus, jobPrice, jobOwner
Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/createJob
Body:
{
  "jobName": "Job Name",
  "jobDescription": "Job Description",
  "jobType": "full-time",
  "jobLocation": {
    "address": "Job Address",
    "longitude": 153.616961,
    "latitude": -28.652513
  },
  "jobStartDate": "2020-11-01",
  "jobEndDate": "2020-11-02",
  "jobStatus": "available",
  "jobPrice": 100,
  "jobOwner": "5f9f4f8c8f5c9a3c3c7c1b0b"
} 
*/

router.post('/createJob', createJob);

/*############### Update a job by client ##############*/

/* 
Update a specific job
Request body: fields to update
Optional fields: jobName, jobDescription, jobType, jobLocation, jobStartDate, jobEndDate, selectedBid, 
jobStatus (valid values: available, accepted, in-progress, completed, cancelled),
jobPrice, jobOwner
Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/updateJob
Body:
  {
    "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "jobName": "Job Name",
    "jobDescription": "Job Description",
    "jobType": "full-time",
    "jobLocation": {
      "address": "Job Address",
      "longitude": 153.616961,
      "latitude": -28.652513
    },
    "jobStartDate": "2020-11-01",
    "jobEndDate": "2020-11-02",
    "selectedBid": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "jobStatus": "available",
    "jobPrice": 100,
    "jobOwner": "5f9f4f8c8f5c9a3c3c7c1b0b"
  } 
*/

router.patch('/updateJob', updateJob);

/*############### Submit a bid for a job ##############*/

/*
Submit a bid for a job
Required fields: jobId, userId, bid
Optional fields: bidStatus (valid values: submitted, assigned, withdrawn)
Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/submitBid
Body:
  {
    "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "bid": 100,
    "bidStatus": "submitted"
  }
*/

router.patch('/submitBid', submitBid);

/*############### Update a bid for a job ##############*/

/*
Update a bid for a job
Required fields: jobId, userId
Optional fields: bid, bidStatus (valid values: submitted, assigned, withdrawn)
Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/updateBid
Body:
  {
    "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "bidStatus": "assigned"
  }
*/

router.patch('/updateBid', updateBid);

/*############### Get all jobs by client ##############*/

// Get all jobs by client
// Required fields: userId
// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getAllJobsByClient/5f9f4f8c8f5c9a3c3c7c1b0b

router.get('/getAllJobsByClient/:userId', getAllJobsByClient);

/*############### Get all jobs bid by service provider ##############*/

// Get all jobs by service provider
// Required fields: userId
// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getAllJobsByServiceProvider/5f9f4f8c8f5c9a3c3c7c1b0b

router.get('/getAllJobsByServiceProvider/:userId', getAllJobsByServiceProvider);

/*############### Get all jobs ##############*/

// Get all jobs
// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getAllJobs

router.get('/getAllJobs', getAllJobs);

/*############### Get job by id ##############*/

// Get job by id
// Required fields: jobId
// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getJobById/5f9f4f8c8f5c9a3c3c7c1b0b

router.get('/getJobById/:jobId', getJobById);

/*############### Delete job ##############*/

/*
Delete job
Required fields: jobId
Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/deleteJob
Body:
  {
    "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b"
  }
*/

router.delete('/deleteJob', deleteJob);


/*############### Display available routes in Job ##############*/

/*
Display available routes in Job
*/

router.get('/', (req, res) => {
  const url = new URL(req.originalUrl, `${req.headers['x-forwarded-proto']}://${req.headers.host}`);
  const baseUrl = `${req.protocol}://${req.hostname}${url.port ? `:${url.port}` : ''}${req.baseUrl}`;
  const available_routes = [
    {
      path: '/createJob',
      method: 'POST',
      description: 'Create a new job by client',
      requiredFields: ['jobName', 'jobDescription', 'jobType', 'jobLocation', 'jobStartDate', 'jobEndDate', 'jobStatus', 'jobPrice', 'jobOwner'],
      example: {
        url: `${baseUrl}/createJob`,
        body: {
          "jobName": "Job Name",
          "jobDescription": "Job Description",
          "jobType": "full-time",
          "jobLocation": {
            "address": "Job Address",
            "longitude": 153.616961,
            "latitude": -28.652513
          },
          "jobStartDate": "2020-11-01",
          "jobEndDate": "2020-11-02",
          "jobStatus": "available",
          "jobPrice": 100,
          "jobOwner": "5f9f4f8c8f5c9a3c3c7c1b0b"
        }
      }
    },
    {
      path: '/updateJob',
      method: 'PATCH',
      description: 'Update a job by client',
      requiredFields: ['jobId'],
      optionalFields: ['jobName', 'jobDescription', 'jobType', 'jobLocation', 'jobStartDate', 'jobEndDate', 'selectedBid', 'jobStatus', 'jobPrice', 'jobOwner'],
      example: {
        url: `${baseUrl}/updateJob`,
        body: {
          "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
          "jobName": "Job Name",
          "jobDescription": "Job Description",
          "jobType": "full-time",
          "jobLocation": {
            "address": "Job Address",
            "longitude": 153.616961,
            "latitude": -28.652513
          },
          "jobStartDate": "2020-11-01",
          "jobEndDate": "2020-11-02",
          "selectedBid": "5f9f4f8c8f5c9a3c3c7c1b0b",
          "jobStatus": "available",
          "jobPrice": 100,
          "jobOwner": "5f9f4f8c8f5c9a3c3c7c1b0b"
        }
      }
    },
    {
      path: '/submitBid',
      method: 'PATCH',
      description: 'Submit a bid for a job by service provider',
      requiredFields: ['jobId', 'userId', 'bid'],
      optionalFields: ['bidStatus'],
      example: {
        url: `${baseUrl}/submitBid`,
        body: {
          "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
          "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
          "bid": 100,
          "bidStatus": "submitted"
        }
      }
    },
    {
      path: '/updateBid',
      method: 'PATCH',
      description: 'Update a bid for a job by service provider',
      requiredFields: ['jobId', 'userId'],
      optionalFields: ['bid', 'bidStatus'],
      example: {
        url: `${baseUrl}/updateBid`,
        body: {
          "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
          "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
          "bidStatus": "assigned"
        }
      }
    },
    {
      path: '/getAllJobsByClient/:userId',
      method: 'GET',
      description: 'Get all jobs by client',
      requiredFields: ['userId'],
      example: {
        url: `${baseUrl}/getAllJobsByClient/5f9f4f8c8f5c9a3c3c7c1b0b`
      }
    },
    {
      path: '/getAllJobsByServiceProvider/:userId',
      method: 'GET',
      description: 'Get all jobs by service provider',
      requiredFields: ['userId'],
      example: {
        url: `${baseUrl}/getAllJobsByServiceProvider/5f9f4f8c8f5c9a3c3c7c1b0b`
      }
    },
    {
      path: '/getAllJobs',
      method: 'GET',
      description: 'Get all jobs',
      requiredFields: null,
      example: {
        url: `${baseUrl}/getAllJobs`
      }
    },
    {
      path: '/getJobById/:jobId',
      method: 'GET',
      description: 'Get job by id',
      requiredFields: ['jobId'],
      example: {
        url: `${baseUrl}/getJobById/5f9f4f8c8f5c9a3c3c7c1b0b`
      }
    },
    {
      path: '/deleteJob',
      method: 'DELETE',
      description: 'Delete job',
      requiredFields: ['jobId'],
      example: {
        url: `${baseUrl}/deleteJob`,
        body: {
          "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b"
        }
      }
    }
  ];

  const formatted_routes = available_routes.map(route => {
    const requiredFields = route.requiredFields ? `Required fields: ${route.requiredFields.join(', ')}` : '';
    const optionalFields = route.optionalFields ? `Optional fields: ${route.optionalFields.join(', ')}` : '';
    const example = route.example ? `Example: ${JSON.stringify(route.example, null, 2)}` : '';
    const divider = `\n#############################################\n`

    return `${divider}Endpoint: ${route.path}\nUsage: ${route.description}\nMethod: ${route.method}\n${requiredFields}\n${optionalFields ? optionalFields + `\n` : ''}${example ? example : ''}\n`;
  }).join('\n');

  res.set('Content-Type', 'text/plain');
  res.status(200).send(`API endpoints for Job\n${formatted_routes}`);
}
);

module.exports = router;