// Routes for Storage and update of files
// Path: routes/File.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    uploadSingle,
    uploadMultiple,
    updateFile,
    updateFiles,
    streamFile,
    downloadFile,
    getFileById,
    getAllFilesByUser,
    getAllFilesByName,
    deleteFile,
    deleteFiles,
    getFilesByUsage,
} = require('../controllers/File');

/*############### Upload a single file ##############*/

// Upload a single file
// Request body: userId (string), usage(string), file (file). (file should be multipart/form-data)
router.post('/uploadSingle', upload.single('file'), uploadSingle);


/*############### Upload multiple files ##############*/

// Upload multiple files
// Request body: userIds (array), usages(array), files (array). (files should be multipart/form-data)
router.post('/uploadMultiple', upload.array('files'), uploadMultiple);


/*############### Update a single file ##############*/

// Update a specific file
// Request params: fileId (ObjectId, required)
// Request body: userId (string, optional), usage (string, optional), filename (string, optional), file (file, optional)
// file should be sent as multipart/form-data
router.patch('/update/:fileId', upload.single('file'), updateFile);


/*############### Update multiple files ##############*/

// Update multiple files
// Request body: updates (JSON stringified array of objects with fields: _id (required), filename (optional), metadata (optional object with fields: userId (optional), usage (optional)))
// files (array, optional) files should be sent as multipart/form-data with the same order as updates
router.patch('/update', upload.array('files'), updateFiles);


/*############### Stream a file ##############*/

// Stream a specific file
// Request params: fileId
router.get('/stream/:fileId', streamFile);


/*############### Download a file ##############*/

// Download a specific file
// Request params: fileId
router.get('/download/:fileId', downloadFile);


/*############### Get file details ##############*/

// Get a specific file details by id
// Request params: fileId
router.get('/file/:fileId', getFileById);


/*############### Get all files uploaded by a user ##############*/

// Get all files by a specific user
// Request query: userId
router.get('/user/:userId', getAllFilesByUser);


/*############### Get all files with a specific name ##############*/

// Get all files with a specific name
// Request query: filename
router.get('/filename/:filename', getAllFilesByName);


/*############### Get all files with a specific usage ##############*/

// Get all files of a specific usage
// Request params: type
router.get('/usage/:usage', getFilesByUsage);


/*############### Delete a file ##############*/

// Delete a specific file
// Request params: fileId
router.delete('/delete/:fileId', deleteFile);


/*############### Delete multiple files ##############*/

// Delete specific files
// Request body: fileIds (array)
router.post('/delete', deleteFiles);

module.exports = router;