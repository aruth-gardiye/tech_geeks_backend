// MongoDB schema for Job
// Path: schemas/Job.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi').extend(require('@joi/date'));
const moment = require('moment');

const jobSchema = new Schema(
  {
    jobName: {
      type: String,
      required: true,
      unique: false,
      minlength: 1,
      trim: true
    },
    jobDescription: {
      type: String,
      required: false,
      minlength: 1,
      trim: true
    },
    jobType: {
      type: String,
      required: true,
      enum: ['full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship']
    },
    jobLocation: {
      _id: false,
      address: {
        type: String,
        required: false,
      },
      longitude: {
        type: Number,
        required: false
      },
      latitude: {
        type: Number,
        required: false
      }
    },
    jobStartDate: {
      type: Date,
      required: false,
      minlength: 1,
      trim: true
    },
    jobEndDate: {
      type: Date,
      required: false,
      minlength: 1,
      trim: true
    },
    // bids submitted by service providers
    jobApplicants: [{
      _id: false,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        minlength: 1,
      },
      bid: {
        type: Number,
        required: true,
        minlength: 1,
        trim: true
      },
      bidStatus: {
        type: String,
        required: false,
        enum: ['submitted', 'assigned', 'accepted', 'rejected', 'withdrawn', 'stale'],
        default: 'submitted'
      }
    }],
    selectedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      minlength: 1,
    },
    jobStatus: {
      type: String,
      required: true,
      enum: ['available', 'accepted', 'assigned', 'in-progress', 'completed', 'expired', 'cancelled'],
      default: 'available'
    },
    jobPrice: {
      type: Number,
      required: true,
      minlength: 1,
      trim: true
    },
    jobOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      minlength: 1,
    },
  }, 
  {
    timestamps: {
      createdAt: 'jobCreated',
      updatedAt: 'jobUpdated'
    }
  }
);

// sort jobApplicants by bid in ascending order
jobSchema.methods.sortJobApplicantsByBid = function() {
  this.jobApplicants.sort((a, b) => a.bid - b.bid);
};

// validate job
jobSchema.statics.validateJob = function (job) {
  const schema = Joi.object({
    jobName: Joi.string().min(1).required(),
    jobDescription: Joi.string().min(1).optional(),
    jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship').required(),
    jobLocation: Joi.object({
      address: Joi.string().min(1).optional(),
      longitude: Joi.number().optional(),
      latitude: Joi.number().optional()
    }).optional(),
    jobStartDate: Joi.date().format('YYYY-MM-DD').min(moment().startOf('day')).required(),
    jobEndDate: Joi.date().format('YYYY-MM-DD').min(Joi.ref('jobStartDate')).required(),
    jobApplicants: Joi.array().items(Joi.object({
      userId: Joi.string().min(1).required(),
      bid: Joi.number().min(1).required(),
      bidStatus: Joi.string().valid('submitted', 'accepted', 'assigned', 'rejected', 'withdrawn', 'stale').required()
    })).optional(),
    jobStatus: Joi.string().valid('available', 'accepted', 'assigned', 'in-progress', 'completed', 'expired', 'cancelled').required(),
    jobPrice: Joi.number().min(1).required(),
    jobOwner: Joi.string().min(1).required(),
  });
  return schema.validate(job);
}

// validate job update by client
jobSchema.statics.validateJobUpdate = function (job) {
  const schema = Joi.object({
    jobId: Joi.string().hex().length(24).required(),
    jobName: Joi.string().min(1).optional(),
    jobDescription: Joi.string().min(1).optional(),
    jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship').optional(),
    jobLocation: Joi.object({
      address: Joi.string().min(1).optional(),
      longitude: Joi.number().optional(),
      latitude: Joi.number().optional()
    }).optional(),
    jobStartDate: Joi.date().format('YYYY-MM-DD').optional(),
    jobEndDate: Joi.date().format('YYYY-MM-DD').min(Joi.ref('jobStartDate')).optional(),
    jobApplicants: Joi.array().items(Joi.object({
      userId: Joi.string().hex().length(24).required(),
      bid: Joi.number().min(1).required(),
      bidStatus: Joi.string().valid('accepted', 'rejected').required()
    })).optional(),
    selectedBid: Joi.string().hex().length(24).optional(),
    jobStatus: Joi.string().valid('available', 'accepted', 'in-progress', 'completed', 'cancelled').optional(),
    jobPrice: Joi.number().min(1).optional(),
    jobOwner: Joi.string().min(1).optional(),
  });
  return schema.validate(job);
}

// validate job bid and bid update by service provider
jobSchema.statics.validateJobUpdateByServiceProvider = function (job) {
  const schema = Joi.object({
    jobId: Joi.string().hex().length(24).required(),
    userId: Joi.string().hex().length(24).required(),
    bid: Joi.number().min(1).optional(),
    bidStatus: Joi.string().valid('submitted', 'assigned', 'withdrawn').optional()
  });
  return schema.validate(job);
}

module.exports = mongoose.model('Job', jobSchema);