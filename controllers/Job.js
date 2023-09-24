// // MongoDB schema for Job
// // Path: schemas/Job.js

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const Joi = require('joi');

// const jobSchema = new Schema({
//   _id: mongoose.Schema.Types.ObjectId,
//   jobName: {
//     type: String,
//     required: true,
//     unique: false,
//     minlength: 1,
//     trim: true
//   },
//   jobDescription: {
//     type: String,
//     required: false,
//     minlength: 1,
//     trim: true
//   },
//   jobType: {
//     type: String,
//     required: true,
//     enum: ['full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship']
//   },
//   jobLocation: {
//     _id: false,
//     address: {
//       type: String,
//       required: false,
//     },
//     longitude: {
//       type: Number,
//       required: false
//     },
//     latitude: {
//       type: Number,
//       required: false
//     }
//   },
//   jobStartDate: {
//     type: Date,
//     required: false,
//     minlength: 1,
//     trim: true
//   },
//   jobEndDate: {
//     type: Date,
//     required: false,
//     minlength: 1,
//     trim: true
//   },
//   // bids submitted by service providers
//   jobApplicants: [{
//     _id: false,
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       minlength: 1,
//     },
//     bid: {
//       type: Number,
//       required: true,
//       minlength: 1,
//       trim: true
//     },
//     bidStatus: {
//       type: String,
//       required: false,
//       enum: ['submitted', 'accepted', 'rejected', 'withdrawn'],
//       default: 'submitted'
//     }
//   }],
//   selectedBid: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: false,
//       minlength: 1,
//     },
//   jobStatus: {
//     type: String,
//     required: true,
//     enum: ['available', 'accepted', 'in-progress', 'completed', 'expired', 'cancelled'],
//     default: 'available'
//   },
//   jobPrice: {
//     type: Number,
//     required: true,
//     minlength: 1,
//     trim: true
//   },
//   jobOwner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     minlength: 1,
//   },
//   timestamps: {
//     jobCreated: 'created_at',
//     jobUpdated: 'updated_at'
//   }
// });

// // validate job
// jobSchema.statics.validateJob = function (job) {
//   const schema = Joi.object({
//     jobName: Joi.string().min(1).required(),
//     jobDescription: Joi.string().min(1).optional(),
//     jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship').required(),
//     jobLocation: Joi.object({
//       address: Joi.string().min(1).optional(),
//       longitude: Joi.number().optional(),
//       latitude: Joi.number().optional()
//     }).optional(),
//     jobStartDate: Joi.date().format('YYYY-MM-DD').min('now').required(),
//     jobEndDate: Joi.date().format('YYYY-MM-DD').min(Joi.ref('jobStartDate')).required(),
//     jobApplicants: Joi.array().items(Joi.object({
//       userId: Joi.string().min(1).required(),
//       bid: Joi.number().min(1).required(),
//       bidStatus: Joi.string().valid('submitted', 'accepted', 'rejected', 'withdrawn').required()
//     })).optional(),
//     jobStatus: Joi.string().valid('available', 'accepted', 'in-progress', 'completed', 'expired', 'cancelled').required(),
//     jobPrice: Joi.number().min(1).required(),
//     jobOwner: Joi.string().min(1).required(),
//   });
//   return schema.validate(job);
// }

// // validate job update by client
// jobSchema.statics.validateJobUpdate = function (job) {
//   const schema = Joi.object({
//     jobId: Joi.string().hex().length(24).required(),
//     jobName: Joi.string().min(1).optional(),
//     jobDescription: Joi.string().min(1).optional(),
//     jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship').optional(),
//     jobLocation: Joi.object({
//       address: Joi.string().min(1).optional(),
//       longitude: Joi.number().optional(),
//       latitude: Joi.number().optional()
//     }).optional(),
//     jobStartDate: Joi.date().format('YYYY-MM-DD').min('now').optional(),
//     jobEndDate: Joi.date().format('YYYY-MM-DD').min(Joi.ref('jobStartDate')).optional(),
//     jobApplicants: Joi.array().items(Joi.object({
//       userId: Joi.string().hex().length(24).required(),
//       bid: Joi.number().min(1).required(),
//       bidStatus: Joi.string().valid('submitted', 'accepted', 'rejected', 'withdrawn').required()
//     })).optional(),
//     selectedBid: Joi.string().hex().length(24).required(),
//     jobStatus: Joi.string().valid('available', 'accepted', 'in-progress', 'completed', 'expired', 'cancelled').optional(),
//     jobPrice: Joi.number().min(1).optional(),
//     jobOwner: Joi.string().min(1).optional(),
//   });
//   return schema.validate(job);
// }

// // validate job bid and bid update by service provider
// jobSchema.statics.validateJobUpdateByServiceProvider = function (job) {
//   const schema = Joi.object({
//     jobId: Joi.string().hex().length(24).required(),
//     userId: Joi.string().hex().length(24).required(),
//     bid: Joi.number().min(1).required(),
//     bidStatus: Joi.string().valid('submitted', 'accepted', 'rejected', 'withdrawn').required()
//   });
//   return schema.validate(job);
// }

// module.exports = mongoose.model('Job', jobSchema);

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

    // if selectedBid is passed in, check if userId is in jobApplicants and update jobStatus and selectedBid
    if (value.selectedBid) {
      const userId = value.selectedBid;
      const jobApplicants = job.jobApplicants;
      const userIds = jobApplicants.map((applicant) => applicant.userId.toString());
      if (userIds.includes(userId)) {
        // find bid in jobApplicants and update bidStatus to accepted
        const bid = jobApplicants.find((applicant) => applicant.userId.toString() === userId);
        bid.bidStatus = 'accepted';
        job.jobStatus = 'accepted';
        job.selectedBid = value.selectedBid;
      } else {
        const err = new Error('User is not an applicant');
        err.status = httpStatus.BAD_REQUEST;
        throw err;
      }
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

// submit bid or update bid for job by service provider
// Usecase: service provider submits a bid for a job
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
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    // check if bid is less than jobPrice
    if (value.bid > job.jobPrice) {
      const err = new Error('Bid is higher than job price');
      err.status = httpStatus.BAD_REQUEST;
      throw err;
    }

    // check if bid is already submitted
    const jobApplicants = job.jobApplicants;
    const userIds = jobApplicants.map((applicant) => applicant.userId.toString());

    if (userIds.includes(value.userId)) {

      // update bid
      const bid = jobApplicants.find((applicant) => applicant.userId.toString() === value.userId);
      bid.bid = value.bid;
      bid.bidStatus = value.bidStatus || bid.bidStatus;

    } else {

      // add bid
      job.jobApplicants.push({
        userId: value.userId,
        bid: value.bid,
        bidStatus: value.bidStatus || 'submitted'
      });

    }

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

    // return jobs
    res.status(httpStatus.OK).json({
      jobs
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
    const user = await User.findOne({ _id: id });
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

    // return jobs
    res.status(httpStatus.OK).json({
      jobs
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

    // return jobs
    res.status(httpStatus.OK).json({
      jobs
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

    // return job
    res.status(httpStatus.OK).json({
      job
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
  getAllJobsByClient,
  getAllJobsByServiceProvider,
  getAllJobs,
  getJobById,
  deleteJob
};