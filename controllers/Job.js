// Controller for the Job model
// Path: controllers/Job.js

const mongoose = require('mongoose');
const httpStatus = require('http-status');
const Job = require('../schemas/Job');
const User = require('../schemas/User');
const moment = require('moment');

// create a new job
// Usecase: client creates a new job for service providers to bid on
// Required: jobName, serviceName, jobType, jobLocation, jobOwner, jobDescription, jobDuration, jobStartDate, jobEndDate, jobPrice
// Optional:  jobStatus

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

    // validate duration using start and end date
    if (value.jobStartDate && value.jobEndDate && value.jobDuration) {
      const startDate = moment(value.jobStartDate);
      const endDate = moment(value.jobEndDate);
      const duration = moment.duration(endDate.diff(startDate));
      const hours = duration.asHours() + 24;

      // calculate duration using the jobDuration object
      const durationObj = value.jobDuration;

      const durationHours = durationObj.hours || 0;
      const durationDays = durationObj.days || 0;
      const durationMonths = durationObj.months || 0;
      const durationYears = durationObj.years || 0;

      // calculate total duration in hours
      const totalDuration = durationHours + durationDays * 24 + durationMonths * 30 * 24 + durationYears * 365 * 24;

      // check if total duration is less than or equal to days
      if (totalDuration > hours) {
        const err = new Error('Job duration is greater than job start and end date');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
    }


    // create job
    const job = new Job({
      jobName: value.jobName,
      jobDescription: value.jobDescription,
      serviceName: value.serviceName,
      jobType: value.jobType,
      jobLocation: value.jobLocation,
      jobDuration: value.jobDuration,
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
// Optional: jobName, jobDescription, serviceName, jobType, jobLocation, jobStartDate, jobEndDate, jobStatus, jobPrice, jobOwner

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

    // if anything related to duration or start and end date is updated, validate duration using start and end date
    if (value.jobStartDate || value.jobEndDate || value.jobDuration) {
      const startDate = moment(value.jobStartDate || job.jobStartDate);
      const endDate = moment(value.jobEndDate || job.jobEndDate);
      const duration = moment.duration(endDate.diff(startDate));
      const hours = duration.asHours() + 24;

      // calculate duration using the jobDuration object
      const durationObj = value.jobDuration;

      const durationHours = durationObj.hours || 0;
      const durationDays = durationObj.days || 0;
      const durationMonths = durationObj.months || 0;
      const durationYears = durationObj.years || 0;

      // calculate total duration in hours
      const totalDuration = durationHours + durationDays * 24 + durationMonths * 30 * 24 + durationYears * 365 * 24;

      // check if total duration is less than or equal to days
      if (totalDuration > hours) {
        const err = new Error('Job duration is greater than job start and end date');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
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
        if (applicant.bid <= value.jobPrice && applicant.bidStatus === 'stale') {
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

    // block jobStatus update on case by case basis
    if (value.jobStatus) {
      switch (value.jobStatus) {
        case 'available': {
          // check if job status is available, then block update if job status is anything except accepted, assigned
          if (!['available', 'accepted', 'assigned'].includes(job.jobStatus)) {
            const err = new Error(`Cannot update job status to available as job is ${job.jobStatus}`);
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }

          // check if end date is passed (Date format: YYYY-MM-DD)
          const today = moment().startOf('day');
          const jobEndDate = moment(job.jobEndDate).startOf('day');
          if (jobEndDate.isBefore(today)) {
            job.jobStatus = 'expired';

            // remove selectedBid
            job.selectedBid = null;

            // make all bids rejected
            const jobApplicants = job.jobApplicants;
            jobApplicants.forEach((applicant) => {
              applicant.bidStatus = 'rejected';
            });

          } else {
            // if job status is assigned, remove selectedBid and corresponding applicant bidStatus to submitted
            if (job.jobStatus === 'assigned') {
              const selectedBid = job.selectedBid;
              const jobApplicants = job.jobApplicants;
              const selectedBidIndex = jobApplicants.findIndex((applicant) => applicant.userId.toString() === selectedBid.toString());
              jobApplicants[selectedBidIndex].bidStatus = 'submitted';
              job.selectedBid = null;
            }

            job.jobStatus = 'available';
          } 
        } break;

        case 'accepted': {
          // check if job status is available, then block update if job status is anything except available
          if (job.jobStatus !== 'available') {
            const err = new Error(`Cannot update job status to accepted as job is ${job.jobStatus}`);
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }
          job.jobStatus = 'accepted';
        } break;

        case 'in-progress': {
          const selectedBid = job.selectedBid;

          // check if selectedBid exists
          if (!selectedBid) {
            const err = new Error('Cannot update job status to in-progress as no bid is selected');
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }

          // check if job status is available, then block update if job status is anything except accepted
          if (job.jobStatus !== 'assigned') {
            const err = new Error(`Cannot update job status to in-progress as job is ${job.jobStatus}`);
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }
          
          job.jobStatus = 'in-progress';
        } break;

        case 'completed': {
          // check if job status is available, then block update if job status is anything except in-progress
          if (job.jobStatus !== 'in-progress') {
            const err = new Error(`Cannot update job status to completed as job is ${job.jobStatus}`);
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }
          job.jobStatus = 'completed';
        } break;

        case 'cancelled': {
          // check if job status is available, then block update if job status is anything except available, accepted, assigned
          if (!['available', 'accepted', 'assigned'].includes(job.jobStatus)) {
            const err = new Error(`Cannot update job status to cancelled as job is ${job.jobStatus}`);
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }

          // remove selectedBid
          job.selectedBid = null;

          // make all bids rejected
          const jobApplicants = job.jobApplicants;
          jobApplicants.forEach((applicant) => {
            applicant.bidStatus = 'rejected';
          });

          job.jobStatus = 'cancelled';
        } break;

        default: {
          const err = new Error('Invalid job status');
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        }
      }
    }

    // update job
    job.jobName = value.jobName || job.jobName;
    job.jobDescription = value.jobDescription || job.jobDescription;
    job.serviceName = value.serviceName || job.serviceName;
    job.jobType = value.jobType || job.jobType;
    job.jobLocation = value.jobLocation || job.jobLocation;
    job.jobDuration = value.jobDuration || job.jobDuration;
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
      switch (bid.bidStatus) {
        case 'accepted':
        case 'assigned':
        case 'rejected':
        case 'stale':
          const err = new Error(`Cannot update bid due to bid is ${bid.bidStatus}`);
          err.status = httpStatus.BAD_REQUEST;
          throw err;
        default:
          // check if bid is less than jobPrice
          if (value.bid > job.jobPrice) {
            const err = new Error('Bid is higher than job price');
            err.status = httpStatus.BAD_REQUEST;
            throw err;
          }
          // update bid
          bid.bid = value.bid;
      }
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

        } else if (JSON.stringify(job.selectedBid) !== JSON.stringify(value.userId)) {
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

    // if bidder opted to be withdrawn, check if job status is available, accepted or assigned
    if (value.bidStatus === 'withdrawn') {
      if (!['available', 'accepted', 'assigned'].includes(job.jobStatus)) {
        const err = new Error(`Cannot withdraw bid as job is ${job.jobStatus}`);
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }

      bid.bidStatus = "withdrawn"

      // if job status is assigned and selectedBid is bidder, update job status to available and remove selectedBid
      if (job.jobStatus === 'assigned' && JSON.stringify(job.selectedBid) === JSON.stringify(value.userId)) {

        // check if end date is passed (Date format: YYYY-MM-DD)
        const today = moment().startOf('day');
        const jobEndDate = moment(job.jobEndDate).startOf('day');
        if (jobEndDate.isBefore(today)) {
          job.jobStatus = 'expired';
        } else {
          job.jobStatus = 'available';
        }

        // remove selectedBid
        job.selectedBid = null;

      }
    }

    // if bidder opted to resubmit withdrawn bid, check if job status is available or accepted and bidder is not selectedBid
    if (value.bidStatus === 'submitted' && JSON.stringify(job.selectedBid) !== JSON.stringify(value.userId)) {
      if (!['available', 'accepted'].includes(job.jobStatus)) {
        const err = new Error(`Cannot resubmit bid as job is ${job.jobStatus}`);
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }

      bid.bidStatus = "submitted"

    } else if (value.bidStatus === 'submitted' && JSON.stringify(job.selectedBid) === JSON.stringify(value.userId)) {
      const err = new Error(`Cannot resubmit bid as previous bid is already ${job.jobStatus}`);
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // save job
    const updatedJob = await job.save();

    res.status(httpStatus.OK).json({
      message: `Bid ${value.bidStatus || 'updated'} successfully`,
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
// Optional parameters: filter, sort
// filter: jobStatus, jobType, jobPrice, serviceName
// sort: jobStatus, jobType, jobPrice

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

    // get query parameters for filtering and sorting
    const { filter, sort } = req.query;

    // create filter object based on query parameters
    const filterObj = {};
    if (filter) {
      const filters = filter.split(',');
      filters.forEach((f) => {
        const [field, value] = f.split(':');
        if (field === 'jobPrice') {
          filterObj[field] = { $gte: value };
        } else {
        filterObj[field] = value;
        }
      });
    }

    // create sort object based on query parameters
    const sortObj = {};
    if (sort) {
      const sorts = sort.split(',');
      sorts.forEach((s) => {
        const [field, order] = s.split(':');
        sortObj[field] = order === 'desc' ? -1 : 1;
      });
    }

    // get all jobs, populate jobOwner and selectedBid to exclude sensitive information
    const jobs = await Job.find({ jobOwner: userId, ...filterObj })
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id username firstName lastName')
      .populate('selectedBid', '_id username firstName lastName')
      .sort(sortObj);

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
// Required: userId
// Optional parameters: filter, sort
// normal filters: jobStatus, jobType, jobPrice, serviceName
// special filters: bidStatus
// sort: jobStatus, jobType, jobPrice
// special sort: bidStatus

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

    // get query parameters for filtering and sorting
    const { filter, sort } = req.query;

    // create filter object based on query parameters
    const filterObj = {};
    if (filter) {
      const filters = filter.split(',');
      filters.forEach((f) => {
        const [field, value] = f.split(':');
        if (field === 'bidStatus') {
          filterObj['jobApplicants.userId'] = userId;
          filterObj['jobApplicants.bidStatus'] = value;
        } else if (field === 'bid') {
          filterObj['jobApplicants.userId'] = userId;
          filterObj['jobApplicants.bid'] = { $gte: value };
        } else {
          filterObj[field] = value;
        }
      });
    }

    // create sort object based on query parameters
    const sortObj = {};
    if (sort) {
      const sorts = sort.split(',');
      sorts.forEach((s) => {
        const [field, order] = s.split(':');
        if (field === 'bidStatus') {
          sortObj['jobApplicants.bidStatus'] = order === 'desc' ? -1 : 1;
        } else if (field === 'bid') {
          sortObj['jobApplicants.bid'] = order === 'desc' ? -1 : 1;
        } else {
        sortObj[field] = order === 'desc' ? -1 : 1;
        }
      });
    }

    // get all jobs bid on by service provider and populate jobOwner and selectedBid to exclude sensitive information
    const jobs = await Job.find({ 'jobApplicants.userId': userId, ...filterObj })
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id username firstName lastName')
      .populate('selectedBid.userId', '_id username firstName lastName')
      .sort(sortObj);

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
// Optional: filter, sort
// filter: jobStatus, jobType, jobPrice, serviceName
// sort: jobStatus, jobType, jobPrice

const getAllJobs = async (req, res) => {
  try {
    // get query parameters for filtering and sorting
    const { filter, sort } = req.query;

    // create filter object based on query parameters
    const filterObj = {};
    if (filter) {
      const filters = filter.split(',');
      filters.forEach((f) => {
        const [field, value] = f.split(':');
        if (field === 'jobPrice') {
          filterObj[field] = { $gte: value };
        } else {
        filterObj[field] = value;
        }
      });
    }

    // create sort object based on query parameters
    const sortObj = {};
    if (sort) {
      const sorts = sort.split(',');
      sorts.forEach((s) => {
        const [field, order] = s.split(':');
        if (field === 'jobPrice') {
          sortObj[field] = order === 'desc' ? -1 : 1;
        } else {
        sortObj[field] = order === 'desc' ? -1 : 1;
        }
      });
    }

    // get all jobs and populate jobOwner and selectedBid to exclude sensitive information
    const jobs = await Job.find(filterObj)
      .populate('jobApplicants.userId', '_id username firstName lastName')
      .populate('jobOwner', '_id userId username firstName lastName')
      .populate('selectedBid', '_id username firstName lastName')
      .sort(sortObj);

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