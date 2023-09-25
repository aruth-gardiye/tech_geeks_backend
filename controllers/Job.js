// Controller for the Job model
// Path: controllers/Job.js

const mongoose = require('mongoose');
const httpStatus = require('http-status');
const Job = require('../schemas/Job');
const User = require('../schemas/User');

// create a new job
// Usecase: client creates a new job for service providers to bid on
// Required: jobName, jobType, jobLocation, jobOwner
// Optional: jobDescription, jobStartDate, jobEndDate

const createJob = async (req, res) => {
  try {
    // validate job
    const { error, value } = Job.validateJob(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if user exists
    const existingUser = await User.findOne({ _id: value.jobOwner });

    if (!existingUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // create job
    const job = new Job({
      jobName: value.jobName,
      jobDescription: value.jobDescription,
      jobType: value.jobType,
      jobLocation: value.jobLocation,
      jobStartDate: value.jobStartDate,
      jobEndDate: value.jobEndDate,
      jobStatus: value.jobStatus,
      jobPrice: value.jobPrice,
      jobOwner: value.jobOwner,
    });

    // save job
    const savedJob = await job.save();

    // return job
    res.status(httpStatus.CREATED).json({
      message: 'Job created successfully',
      job: savedJob
    });
  } catch (err) {
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: err.message
    });
  }
}

// update job
// Usecase: client updates a job
// Required: jobId
// Optional: jobName, jobDescription, jobType, jobLocation, jobStartDate, jobEndDate, jobStatus, jobPrice, jobOwner

const updateJob = async (req, res) => {
  try {
    // validate job update
    const { error, value } = Job.validateJobUpdate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if job exists
    const job = await Job.findById(value.jobId);
    if (!job) {
      const err = new Error('Job not found');
      err.status = httpStatus.NOT_FOUND;
      throw err;
    }

    // if jobPrice is updated, and new jobPrice is higher than old jobPrice, make higher bids stale
    if (value.jobPrice && value.jobPrice !== job.jobPrice) {
      const jobApplicants = job.jobApplicants;
      jobApplicants.forEach((applicant) => {
        if (applicant.bid > value.jobPrice && !['assigned', 'rejected', 'withdrawn'].includes(applicant.bidStatus)) {
          applicant.bidStatus = 'stale';
        }
      });

    // if jobPrice is updated, and new jobPrice is lower than old jobPrice, make lower bids submitted
    } else if (value.jobPrice && value.jobPrice < job.jobPrice) {
      const jobApplicants = job.jobApplicants;
      jobApplicants.forEach((applicant) => {
        if (applicant.bid > value.jobPrice && !['assigned', 'rejected', 'withdrawn'].includes(applicant.bidStatus)) {
          applicant.bidStatus = 'submitted';
        }
      });
    }

    if (value.selectedBid) {

      // check if job status is available, accepted, else throw error
      if (!['available', 'accepted'].includes(job.jobStatus)) {
        const err = new Error(`Cannot select bid as job is ${job.jobStatus}`);
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }

      // check if userId is in jobApplicants and update jobStatus and selectedBid
      const userId = value.selectedBid;
      const jobApplicants = job.jobApplicants;
      const userIds = jobApplicants.map((applicant) => applicant.userId.toString());

      if (userIds.includes(userId)) {

        const bid = jobApplicants.find((applicant) => applicant.userId.toString() === userId);

        // if assigned bid exists, throw error
        if (bid.bidStatus === 'assigned') {
          const err = new Error('Cannot change as assigned bid exists');
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        }

        // if bid is stale, throw error
        if (bid.bidStatus === 'stale') {
          const err = new Error('Bid is stale');
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        }

        // if bid is withdrawn, throw error
        if (bid.bidStatus === 'withdrawn') {
          const err = new Error('Cannot accept withdrawn bid');
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        }

        // if new jobPrice is passed in, check if bid is higher than new jobPrice
        if (value.jobPrice && bid.bid > value.jobPrice) {
          const err = new Error('Bid is higher than job price');
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        }

        // if already accepted bid exists, make it submitted
        const selectedBid = job.selectedBid;
        if (selectedBid) {
          const selectedBidIndex = jobApplicants.findIndex((applicant) => applicant.userId.toString() === selectedBid.toString());
          jobApplicants[selectedBidIndex].bidStatus = 'submitted';
        }

        // find bid in jobApplicants and update bidStatus to accepted
        bid.bidStatus = 'accepted';
        job.jobStatus = 'accepted';
        job.selectedBid = value.selectedBid;
      } else {
        const err = new Error('User is not an applicant');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
    }

    // if jobStatus is updated to in-progress, check if selectedBid exists and update bidStatus to assigned
    if (value.jobStatus === 'in-progress') {
      const selectedBid = job.selectedBid;
      if (!selectedBid) {
        const err = new Error('Cannot update job status to in-progress as no bid is selected');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
      const jobApplicants = job.jobApplicants;
      const selectedBidIndex = jobApplicants.findIndex((applicant) => applicant.userId.toString() === selectedBid.toString());
      jobApplicants[selectedBidIndex].bidStatus = 'assigned';
      job.jobStatus = 'in-progress';
    }

    // if jobStatus is updated to completed, check if job is in-progress and update jobStatus to completed
    if (value.jobStatus === 'completed') {
      if (job.jobStatus !== 'in-progress') {
        const err = new Error('Cannot update job status to completed as job is not in-progress');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
      job.jobStatus = 'completed';
    }

    // if jobStatus is updated to cancelled, check if job is available and update jobStatus to cancelled
    if (value.jobStatus === 'cancelled') {
      if (['in-progress', 'completed', 'cancelled', 'expired'].includes(job.jobStatus)) {
        const err = new Error(`Cannot update job status to cancelled as job is ${job.jobStatus}`);
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
      job.jobStatus = 'cancelled';
    }

    // update job
    job.jobName = value.jobName || job.jobName;
    job.jobDescription = value.jobDescription || job.jobDescription;
    job.jobType = value.jobType || job.jobType;
    job.jobLocation = value.jobLocation || job.jobLocation;
    job.jobStartDate = value.jobStartDate || job.jobStartDate;
    job.jobEndDate = value.jobEndDate || job.jobEndDate;
    job.jobStatus = value.jobStatus || job.jobStatus;
    job.jobPrice = value.jobPrice || job.jobPrice;

    // save job
    const updatedJob = await job.save();

    // return job
    res.status(httpStatus.OK).json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  }
  catch (err) {
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: err.message
    });
  }
}

// submit new bid for job by service provider
// Usecase: service provider submits a new bid for a job
// Required: jobId, userId, bid
// Optional: bidStatus
const submitBid = async (req, res) => {
  try {
    const { error, value } = Job.validateJobUpdateByServiceProvider(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if job exists
    const job = await Job.findById(value.jobId);
    if (!job) {
      const err = new Error('Job not found');
      err.status = httpStatus.NOT_FOUND;
      throw err;
    }

    // check if user exists
    const user = await User.findOne({ _id: value.userId });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // check if bid is less than jobPrice
    if (value.bid && value.bid > job.jobPrice) {
      const err = new Error('Bid is higher than job price');
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if bid is already submitted
    const jobApplicants = job.jobApplicants;
    const userIds = jobApplicants.map((applicant) => applicant.userId.toString());

    if (userIds.includes(value.userId)) {
      const err = new Error('Bid already submitted, please update bid');
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if job status is available or accepted
    if (!['available', 'accepted'].includes(job.jobStatus)) {
      const err = new Error(`Cannot submit bid as job is ${job.jobStatus}`);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    //check if bid is passed in
    if (!value.bid) {
      const err = new Error('Bid is required');
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // add bid
    job.jobApplicants.push({
      userId: value.userId,
      bid: value.bid,
      bidStatus: value.bidStatus || 'submitted'
    });

    // save job
    const updatedJob = await job.save();

    res.status(httpStatus.OK).json({
      message: `Bid ${value.bidStatus || 'submitted'} successfully`,
    });
  }
  catch (err) {
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: err.message
    });
  }
}

// update bid for job by service provider
// Usecase: service provider updates an existing bid for a job
// Required: jobId, userId, bid
// Optional: bidStatus
const updateBid = async (req, res) => {
  try {
    const { error, value } = Job.validateJobUpdateByServiceProvider(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if bid or bidStatus is passed in
    if (!value.bid && !value.bidStatus) {
      const err = new Error('bid or bidStatus is required');
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if job exists
    const job = await Job.findById(value.jobId);
    if (!job) {
      const err = new Error('Job not found');
      err.status = httpStatus.NOT_FOUND;
      throw err;
    }

    // check if user exists
    const user = await User.findOne({ _id: value.userId });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // check if bid is already submitted
    const jobApplicants = job.jobApplicants;
    const userIds = jobApplicants.map((applicant) => applicant.userId.toString());

    if (!userIds.includes(value.userId)) {
      const err = new Error('Bid not submitted, please submit bid');
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    const bid = jobApplicants.find((applicant) => applicant.userId.toString() === value.userId);

    // if bid status is accepted, assigned, rejected or stale, throw error when bid is updated
    if (value.bid && !['accepted', 'assigned', 'rejected', 'stale'].includes(bid.bidStatus)) {

      // check if bid is less than jobPrice
      if (value.bid && value.bid > job.jobPrice) {
        const err = new Error('Bid is higher than job price');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }

      bid.bid = value.bid;

    } else if (value.bid && value.bid != bid.bid && ['accepted', 'assigned', 'rejected', 'stale'].includes(bid.bidStatus)) {
      const err = new Error(`Cannot update bid due to bid is ${bid.bidStatus}`);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // if bidder opted to be assigned, check if job status is accepted by client
    if (value.bidStatus === 'assigned') {
      if (job.jobStatus !== 'accepted') {

        let err;

        // create error based on job status and selectedBid
        if (job.jobStatus !== 'accepted') {
          err = new Error(`Cannot assign bid as job is ${job.jobStatus}`);
          err.status = httpStatus.BAD_REQUEST;
          throw err;

        } else if (job.selectedBid !== value.userId) {
          err = new Error('Cannot assign bid as accepted bid is not submitted by bidder');
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        }

        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }

      bid.bidStatus = "assigned"
      job.jobStatus = "assigned"
      
    }

    // if bidder opted to be withdrawn, check if job status is available or accepted
    if (value.bidStatus === 'withdrawn') {
      if (!['available', 'accepted', 'assigned'].includes(job.jobStatus)) {
        const err = new Error(`Cannot withdraw bid as job is ${job.jobStatus}`);
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }

      bid.bidStatus = "withdrawn"
      job.jobStatus = "available"
    }

    // save job
    const updatedJob = await job.save();

    res.status(httpStatus.OK).json({
      message: `Bid updated successfully`,
    });
  }
  catch (err) {
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: err.message
    });
  }
}

// get all jobs by client
// Usecase: client gets all jobs submitted by them
// Required: userId
// Optional: none

const getAllJobsByClient = async (req, res) => {
  try {
    const userId = req.params.userId;
    // check if user exists
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // get all jobs, populate jobOwner and selectedBid to exclude sensitive information
    const jobs = await Job.find({ jobOwner: userId })
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id username firstName lastName')
      .populate('selectedBid', '_id username firstName lastName');

    // sort jobApplicants array for each job
    jobs.forEach((job) => {
      job.sortJobApplicantsByBid();
    });

    // transform jobApplicants array to include username, firstName and lastName
    const jobApplicants = jobs.map((job) => {
      return job.jobApplicants.map((applicant) => {
        const { _id, username, firstName, lastName } = applicant.userId;
        return {
          userId: _id.toString(),
          username,
          firstName,
          lastName,
          bid: applicant.bid,
          bidStatus: applicant.bidStatus
        };
      });
    });

    // return jobs
    res.status(httpStatus.OK).json({
      jobs: jobs.map((job, index) => {
        return {
          ...job.toObject(),
          jobApplicants: jobApplicants[index]
        };
      })
    });

  } catch (error) {
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: error.message
    });
  }
}

// get all jobs bid on by service provider
// Usecase: service provider gets all jobs
// Required: None

const getAllJobsByServiceProvider = async (req, res) => {
  try {
    const userId = req.params.userId;

    // check if user exists
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // get all jobs bid on by service provider and populate jobOwner and selectedBid to exclude sensitive information
    const jobs = await Job.find({ 'jobApplicants.userId': userId })
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id username firstName lastName')
      .populate('selectedBid', '_id username firstName lastName');

    // sort jobApplicants array for each job
    jobs.forEach((job) => {
      job.sortJobApplicantsByBid();
    });

    // transform jobApplicants array to include username, firstName and lastName
    const jobApplicants = jobs.map((job) => {
      return job.jobApplicants.map((applicant) => {
        const { _id, username, firstName, lastName } = applicant.userId;
        return {
          userId: _id.toString(),
          username,
          firstName,
          lastName,
          bid: applicant.bid,
          bidStatus: applicant.bidStatus
        };
      });
    });

    // return jobs
    res.status(httpStatus.OK).json({
      jobs: jobs.map((job, index) => {
        return {
          ...job.toObject(),
          jobApplicants: jobApplicants[index]
        };
      })
    });
  } catch (error) {
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: error.message
    });
  }
}

// get all jobs
// Usecase: get all jobs
// Required: none
// Optional: none

const getAllJobs = async (req, res) => {
  try {
    // get all jobs and populate jobOwner and selectedBid to exclude sensitive information
    const jobs = await Job.find()
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id userId username firstName lastName')
      .populate('selectedBid', '_id username firstName lastName');

    // sort jobApplicants array for each job
    jobs.forEach((job) => {
      job.sortJobApplicantsByBid();
    });

    // transform jobApplicants array to include username, firstName and lastName
    const jobApplicants = jobs.map((job) => {
      return job.jobApplicants.map((applicant) => {
        const { _id, username, firstName, lastName } = applicant.userId;
        return {
          userId: _id.toString(),
          username,
          firstName,
          lastName,
          bid: applicant.bid,
          bidStatus: applicant.bidStatus
        };
      });
    });

    // return jobs
    res.status(httpStatus.OK).json({
      jobs: jobs.map((job, index) => {
        return {
          ...job.toObject(),
          jobApplicants: jobApplicants[index]
        };
      })
    });
  } catch (error) {
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: error.message
    });
  }
}

// get job details by id
// Usecase: get job by id
// Required: jobId

const getJobById = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // check if job exists
    const job = await Job.findById(jobId)
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id username firstName lastName')
      .populate('selectedBid', '_id username firstName lastName');

    if (!job) {
      const error = new Error('Job not found');
      error.status = httpStatus.NOT_FOUND;
      throw error;
    }

    job.sortJobApplicantsByBid();

    // transform jobApplicants array to include username, firstName and lastName
    const jobApplicants = job.jobApplicants.map((applicant) => {
      const { _id, username, firstName, lastName } = applicant.userId;
      return {
        userId: _id.toString(),
        username,
        firstName,
        lastName,
        bid: applicant.bid,
        bidStatus: applicant.bidStatus
      };
    });

    res.status(httpStatus.OK).json({
      job: {
        ...job.toObject(),
        jobApplicants
      }
    });
  } catch (error) {
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: error.message
    });
  }
}

// delete job
// Usecase: delete job
// Required: jobId

const deleteJob = async (req, res) => {
  try {
    // check if job exists
    const job = await Job.findById(req.body.userId);
    if (!job) {
      const error = new Error('Job not found');
      error.status = httpStatus.NOT_FOUND;
      throw error;
    }

    // delete job
    await job.delete();

    // return job
    res.status(httpStatus.OK).json({
      message: 'Job deleted successfully',
      job
    });
  }
  catch (error) {
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({
      error: error.message
    });
  }
}

module.exports = {
  createJob,
  updateJob,
  submitBid,
  updateBid,
  getAllJobsByClient,
  getAllJobsByServiceProvider,
  getAllJobs,
  getJobById,
  deleteJob
};