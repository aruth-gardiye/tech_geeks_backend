// Routes for Job
// Path: routes/Job.js

const express = require('express');
const router = express.Router();

const {
  createJob,
  updateJob,
  submitBid,
  getAllJobsByClient,
  getAllJobsByServiceProvider,
  getAllJobs,
  getJobById,
  deleteJob
} = require('../controllers/Job');

/*############### Create a new job ##############*/

/* 
Required fields: jobName, jobDescription, jobType, jobLocation, jobStartDate, jobEndDate, jobStatus, jobPrice, jobOwner
Example: http://localhost:3001/api/Job/createJob
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

/*############### Update a job ##############*/

/* 
Update a specific job
Request body: fields to update
Optional fields: jobName, jobDescription, jobType, jobLocation, jobStartDate, jobEndDate, selectedBid, jobStatus, jobPrice, jobOwner
Example: http://localhost:3001/api/Job/updateJob
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
Optional fields: bidStatus
Example: http://localhost:3001/api/Job/submitBid
Body:
  {
    "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "userId": "5f9f4f8c8f5c9a3c3c7c1b0b",
    "bid": 100,
    "bidStatus": "submitted"
  }
*/

router.patch('/submitBid', submitBid);

/*############### Get all jobs by client ##############*/

// Get all jobs by client
// Required fields: userId
// Example: http://localhost:3001/api/Job/getAllJobsByClient/5f9f4f8c8f5c9a3c3c7c1b0b

router.get('/getAllJobsByClient/:userId', getAllJobsByClient);

/*############### Get all jobs bid by service provider ##############*/

// Get all jobs by service provider
// Required fields: userId
// Example: http://localhost:3001/api/Job/getAllJobsByServiceProvider/5f9f4f8c8f5c9a3c3c7c1b0b

router.get('/getAllJobsByServiceProvider/:userId', getAllJobsByServiceProvider);

/*############### Get all jobs ##############*/

// Get all jobs
// Example: http://localhost:3001/api/Job/getAllJobs

router.get('/getAllJobs', getAllJobs);

/*############### Get job by id ##############*/

// Get job by id
// Required fields: jobId
// Example: http://localhost:3001/api/Job/getJobById/5f9f4f8c8f5c9a3c3c7c1b0b

router.get('/getJobById/:jobId', getJobById);

/*############### Delete job ##############*/

/*
Delete job
Required fields: jobId
Example: http://localhost:3001/api/Job/deleteJob
Body:
  {
    "jobId": "5f9f4f8c8f5c9a3c3c7c1b0b"
  }
*/

router.delete('/deleteJob', deleteJob);

module.exports = router;