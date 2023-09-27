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
Create a new job
Required fields: 
  jobName, jobDescription
, jobType (valid values: full-time, part-time, contract, temporary, volunteer, internship)
, jobLocation, jobDuration, jobStartDate, jobEndDate 
, jobStatus (valid values: available)
, jobPrice, jobOwner

Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/createJob

Body:
{
  "jobName": "Job Name",
  "jobDescription": "Job Description",
  "jobType": "full-time",
  "jobDuration": {
    "hours": 8,
    "days": 0,
    "months": 0,
    "years": 0
  },
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
Required fields: jobId
Optional fields: 
  jobName, jobDescription
  , jobType (valid values: full-time, part-time, contract, temporary, volunteer, internship)
  , jobLocation, jobDuration, jobStartDate, jobEndDate, selectedBid, 
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
    "jobDuration": {
      "hours": 8,
      "days": 0,
      "months": 0,
      "years": 0
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
Optional fields: bidStatus (valid values: submitted)
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
// Optional fields: filter, sort

// Special filter keys: jobPrice (greater than or equal to)
// Normal filter keys: jobStatus, jobType

// Special sort keys: jobPrice
// Normal sort keys: createdAt

// Special filter values: jobPrice (value)
// Normal filter values: jobStatus (available, accepted, assigned, in-progress, completed, expired, cancelled), jobType (full-time, part-time, contract, temporary, volunteer, internship)

// Special sort values: jobPrice (desc, asc)
// Normal sort values: createdAt (desc, asc)

// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getAllJobsByClient/6513eae61384788dd14e8334?filter=jobStatus:completed,jobType:full-time,jobPrice:30&sort=jobPrice:desc

router.get('/getAllJobsByClient/:userId', getAllJobsByClient);

/*############### Get all jobs bid by service provider ##############*/

// Get all jobs by service provider
// Required fields: userId
// Optional fields: filter, sort

// Valid special filter keys: bidStatus, bid (greater than or equal to)
// Valid normal filter keys: jobStatus, jobType, jobPrice

// Valid special sort keys: bidStatus, bid
// Valid normal sort keys: jobStatus, jobType, jobPrice

// Valid special filter values: bidStatus (submitted, assigned, withdrawn), bid (value)
// Valid normal filter values: jobStatus (available, accepted, assigned, in-progress, completed, expired, cancelled), jobType (full-time, part-time, contract, temporary, volunteer, internship), jobPrice (value)

// Valid special sort values: bidStatus (desc, asc), bid (desc, asc)
// Valid normal sort values: jobPrice (desc, asc), createdAt (desc, asc)

// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getAllJobsByServiceProvider/6513eb8b1384788dd14e833a?filter=bidStatus:assigned,bid:30&sort=bid:desc

router.get('/getAllJobsByServiceProvider/:userId', getAllJobsByServiceProvider);

/*############### Get all jobs ##############*/

// Get all jobs
// Required fields: none
// Optional fields: filter, sort

// Valid special filter keys: jobPrice (greater than or equal to)
// Valid normal filter keys: jobStatus, jobType

// Valid special sort keys: jobPrice
// Valid normal sort keys: createdAt

// Valid special filter values: jobPrice (value)
// Valid normal filter values: jobStatus (available, accepted, assigned, in-progress, completed, expired, cancelled), jobType (full-time, part-time, contract, temporary, volunteer, internship)

// Valid special sort values: jobPrice (desc, asc)
// Valid normal sort values: createdAt (desc, asc)

// Example: https://techgeeksprotobackend.azurewebsites.net/api/Job/getAllJobs?filter=jobStatus:completed,jobType:full-time,jobPrice:30&sort=jobPrice:desc

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
      requiredFields: ['jobName', 'jobDescription', 'jobType', 'jobLocation', 'jobDuration', 'jobStartDate', 'jobEndDate', 'jobStatus', 'jobPrice', 'jobOwner'],
      validValues: {
        jobType: ['full-time', 'part-time', 'contract'],
        jobStatus: ['available', 'in-progress', 'completed']
      },
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
          "jobDuration": {
            "hours": 8,
            "days": 0,
            "months": 0,
            "years": 0
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
      optionalFields: ['jobName', 'jobDescription', 'jobType', 'jobLocation', 'jobDuration', 'jobStartDate', 'jobEndDate', 'selectedBid', 'jobStatus', 'jobPrice', 'jobOwner'],
      validValues: {
        jobType: ['full-time', 'part-time', 'contract'],
        jobStatus: ['available', 'in-progress', 'completed']
      },
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
          "jobDuration": {
            "hours": 8,
            "days": 0,
            "months": 0,
            "years": 0
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
      validValues: {
        bidStatus: ['submitted']
      },
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
      validValues: {
        bidStatus: ['submitted', 'assigned', 'withdrawn']
      },
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
      optionalFields: ['filter', 'sort'],
      validValues: {
        filter: {
          jobPrice: ['value'],
          jobStatus: ['available', 'accepted', 'assigned', 'in-progress', 'completed', 'expired', 'cancelled'],
          jobType: ['full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship']
        },
        sort: {
          jobPrice: ['desc', 'asc'],
          createdAt: ['desc', 'asc']
        }
      },
      example: {
        url: `${baseUrl}/getAllJobsByClient/5f9f4f8c8f5c9a3c3c7c1b0b?filter=jobStatus:completed,jobType:full-time,jobPrice:30&sort=jobPrice:desc`
      }
    },
    {
      path: '/getAllJobsByServiceProvider/:userId',
      method: 'GET',
      description: 'Get all jobs by service provider',
      requiredFields: ['userId'],
      optionalFields: ['filter', 'sort'],
      validValues: {
        filter: {
          bidStatus: ['submitted', 'assigned', 'accepted', 'rejected', 'withdrawn', 'stale'],
          bid: ['value'],
          jobStatus: ['available', 'accepted', 'assigned', 'in-progress', 'completed', 'expired', 'cancelled'],
          jobType: ['full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship'],
          jobPrice: ['value']
        },
        sort: {
          bidStatus: ['desc', 'asc'],
          bid: ['desc', 'asc'],
          jobStatus: ['desc', 'asc'],
          jobType: ['desc', 'asc'],
          jobPrice: ['desc', 'asc']
        }
      },
      example: {
        url: `${baseUrl}/getAllJobsByServiceProvider/5f9f4f8c8f5c9a3c3c7c1b0b?filter=bidStatus:assigned,bid:30&sort=bid:desc`
      }
    },
    {
      path: '/getAllJobs',
      method: 'GET',
      description: 'Get all jobs',
      requiredFields: null,
      optionalFields: ['filter', 'sort'],
      validValues: {
        filter: {
          jobPrice: ['value'],
          jobStatus: ['available', 'accepted', 'assigned', 'in-progress', 'completed', 'expired', 'cancelled'],
          jobType: ['full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship']
        },
        sort: {
          jobPrice: ['desc', 'asc'],
          createdAt: ['desc', 'asc']
        }
      },
      example: {
        url: `${baseUrl}/getAllJobs?filter=jobStatus:completed,jobType:full-time,jobPrice:30&sort=jobPrice:desc`
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
    const validValues = route.validValues ? `Valid field values:\n${JSON.stringify(route.validValues, null, 2)}` : '';
    const example = route.example ? `Example: ${JSON.stringify(route.example, null, 2)}` : '';
    const divider = `\n#############################################\n`

    return `${divider}Endpoint: ${route.path}\nUsage: ${route.description}\nMethod: ${route.method}\n${requiredFields}\n${optionalFields ? optionalFields + `\n` : ''}${validValues ? validValues + `\n` : ''}${example ? example : ''}\n`;
  }).join('\n');

  res.set('Content-Type', 'text/plain');
  res.status(200).send(`API endpoints for Job\n${formatted_routes}`);
}
);

module.exports = router;