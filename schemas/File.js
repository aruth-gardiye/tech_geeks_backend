// MongoDB schema for GridFS file storage
// Path: schemas/File.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  filename: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  contentType: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    trim: true
  },
  length: {
    type: Number,
    required: true,
    min: 0
  },
  chunkSize: {
    type: Number,
    required: true,
    min: 0
  },
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  aliases: {
    type: [String],
    required: false,
    default: []
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false,
    default: {}
  },
  md5: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    trim: true
  }
});

module.exports = mongoose.model('File', fileSchema);