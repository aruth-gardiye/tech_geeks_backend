const mongoose = require('mongoose');
const httpStatus = require('http-status');
const File = require('../schemas/File');

// upload single file
const uploadSingle = async (req, res) => {
  try {
    const file = req.file; // file passed from client
    const userId = req.body.userId || null; // userId of the user who uploaded the file
    const usage = req.body.usage || null; // usage of the file (e.g. profile picture, etc.)

    if (!file) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'No file provided' });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const uploadStream = bucket.openUploadStreamWithId(new mongoose.Types.ObjectId(), file.originalname, {
      metadata: {
        userId: userId,
        usage: usage,
      },
      contentType: file.mimetype,
    });

    uploadStream.on('error', (err) => {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error occurred while uploading file' });
    });

    uploadStream.on('finish', () => {
      res.status(httpStatus.CREATED).json({
        message: 'File uploaded successfully',
        file: {
          _id: uploadStream.id,
          filename: file.originalname,
          contentType: file.mimetype,
          metadata: {
            userId: userId,
            usage: usage,
          },
        },
      });
    });

    uploadStream.end(file.buffer);
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// upload multiple files
const uploadMultiple = async (req, res) => {
  try {
    const files = req.files; // files passed from client (array of files)
    const userIds = req.body.userIds; // userIds of the users who uploaded the files (array of userIds)
    const usages = req.body.usages; // usages of the files (array of usages)

    if (!files || files.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'No files provided' });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    let uploadedFiles = [];

    const uploadFile = (file, userId, usage) => {
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStreamWithId(
          new mongoose.Types.ObjectId(),
          file.originalname,
          {
            metadata: {
              userId: userId,
              usage: usage,
            },
            contentType: file.mimetype,
          }
        );

        uploadStream.on('error', (err) => {
          reject(err);
        });

        uploadStream.on('finish', () => {
          uploadedFiles.push({
            _id: uploadStream.id,
            filename: file.originalname,
            contentType: file.mimetype,
            metadata: {
              userId: userId,
              usage: usage,
            },
          });
          resolve();
        });

        uploadStream.end(file.buffer);
      });
    };

    const uploadPromises = files.map((file, index) =>
      uploadFile(file, userIds[index], usages[index])
    );

    await Promise.all(uploadPromises);

    res.status(httpStatus.CREATED).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// Use to modify file metadata and filename in the 'storage' gridfs bucket.
const performUpdate = async (fileId, userId, filename, usage, file) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'storage',
  });

  //find file in database
  const existingFile = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

  if (!existingFile || existingFile.length === 0) {
    throw new Error('File not found');
  }

  try {
    if (file) {
      //delete old file
      const db = mongoose.connection.db;
      const fileCollection = db.collection('storage.files');
      const chunksCollection = db.collection('storage.chunks');

      const fileObjectId = new mongoose.Types.ObjectId(fileId);

      await fileCollection.deleteOne({ _id: fileObjectId });
      await chunksCollection.deleteMany({ files_id: fileObjectId });

      //upload new file
      const uploadStream = bucket.openUploadStreamWithId(
        new mongoose.Types.ObjectId(fileId),
        filename,
        {
          metadata: {
            userId: userId,
            usage: usage,
          },
          contentType: file.mimetype,
        }
      );

      uploadStream.on('error', (err) => {
        throw new Error('Error occurred while uploading file', err);
      });

      let updatedFiles = [];

      const updatedFile = (file, filename, fileId, userId, usage) => {
        return new Promise((resolve, reject) => {
          const uploadStream = bucket.openUploadStreamWithId(
            new mongoose.Types.ObjectId(fileId),
            filename,
            {
              metadata: {
                userId: userId,
                usage: usage,
              },
              contentType: file.mimetype,
            }
          );

          uploadStream.on('error', (err) => {
            reject(err);
          });

          uploadStream.on('finish', () => {
            updatedFiles.push({
              _id: uploadStream.id,
              filename: file.originalname,
              contentType: file.mimetype,
              metadata: {
                userId: userId,
                usage: usage,
              },
            });
            resolve();
          });

          uploadStream.end(file.buffer);
        });
      };

      const updatePromise = updatedFile(file, filename, fileId, userId, usage);

      await Promise.resolve(updatePromise);

      return updatedFiles[0];
    }

    else {
      const updateData = {
        filename: filename || existingFile[0].filename,
        metadata: {
          userId: userId || existingFile[0].metadata.userId,
          usage: usage || existingFile[0].metadata.usage,
        },
      };

      const updatedFile = await File.findByIdAndUpdate(fileId, updateData, { new: true });
      return updatedFile;
    };
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// update single file
const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params; // id of the file to be updated (passed as a route parameter)
    const { userId, filename, usage } = req.body; // new metadata and filename for the file (passed as a request body)
    const file = req.file; // new file to replace the old file (passed as a file)

    const updatedFile = await performUpdate(fileId, userId, filename, usage, file || null);

    res.status(httpStatus.OK).json({
      message: 'File updated successfully',
      file: updatedFile,
    });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// update multiple files
const updateFiles = async (req, res) => {
  try {
    const updates = JSON.parse(req.body.updates); // array of arrays (including _id, metadata, filename) (passed as a request body)
    const files = req.files; // array of files to replace the old files (passed as files)

    const updatedFiles = await Promise.all(
      updates.map(async (update, index) => {
        const { _id, metadata, filename } = update;
        const fileId = _id;
        const file = files ? files[index] : null;
        const { userId, usage } = metadata;
        return await performUpdate(fileId, userId, filename, usage, file || null);
      })
    );

    res.status(httpStatus.OK).json({
      message: 'Files updated successfully',
      files: updatedFiles,
    });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// stream file from database to client
const streamFile = async (req, res) => {
  try {
    const { fileId } = req.params; // id of the file to be streamed (passed as a route parameter)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const fileInfo = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (!fileInfo || fileInfo.length === 0) {
      res.status(httpStatus.NOT_FOUND).json({ error: 'File not found' });
    }

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    res.set('Content-Type', fileInfo[0].contentType);
    res.set('Content-Disposition', `inline; filename="${fileInfo[0].filename}"`);

    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error occurred while streaming file' });
    });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};


// download file from database and server storage folder
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params; // id of the file to be downloaded (passed as a route parameter)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const fileInfo = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (!fileInfo || fileInfo.length === 0) {
      res.status(httpStatus.NOT_FOUND).json({ error: 'File not found' });
    }

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    res.set('Content-Type', fileInfo[0].contentType);
    res.set('Content-Disposition', `attachment; filename="${fileInfo[0].filename}"`);

    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error occurred while downloading file' });
    });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// get file info from database by id
const getFileById = async (req, res) => {
  try {
    const { fileId } = req.params; // id of the file to be retrieved (passed as a route parameter)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const fileInfo = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (!fileInfo || fileInfo.length === 0) {
      return res.status(httpStatus.NO_CONTENT).json({ message: "No files found for the provided fileId" });
    }

    res.status(httpStatus.OK).json(fileInfo[0]);
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// get all files from database for a specific user
const getAllFilesByUser = async (req, res) => {
  try {
    const { userId } = req.params; // id of the user whose files are to be retrieved (passed as a route parameter)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const files = await bucket.find({ 'metadata.userId': userId }).toArray();

    if (!files || files.length === 0) {
      return res.status(httpStatus.NO_CONTENT).json({ message: "No files found for the provided user" });
    }

    res.status(httpStatus.OK).json({ files });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// get all files from database for a specific file name
const getAllFilesByName = async (req, res) => {
  try {
    const { filename } = req.params; // name of the files to be retrieved (passed as a route parameter)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const files = await bucket.find({ filename: filename }).toArray();

    if (!files || files.length === 0) {
      return res.status(httpStatus.NO_CONTENT).json({ message: "No files found with the provided name" });
    }

    res.status(httpStatus.OK).json({ files });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// get all files of a certain usage
const getFilesByUsage = async (req, res) => {
  try {
    const { usage } = req.params; // usage of the files to be retrieved (passed as a route parameter)

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const files = await bucket.find({ 'metadata.usage': usage }).toArray();

    if (!files || files.length === 0) {
      return res.status(httpStatus.NO_CONTENT).json({ message: "No files found of the provided usage" });
    }

    res.status(httpStatus.OK).json({ files });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// delete file from database provided with fileId
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params; // id of the file to be deleted (passed as a route parameter)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    const db = mongoose.connection.db;
    const fileCollection = db.collection('storage.files');
    const chunksCollection = db.collection('storage.chunks');

    const fileResult = await fileCollection.deleteOne({ _id: new mongoose.Types.ObjectId(fileId) });
    await chunksCollection.deleteMany({ files_id: new mongoose.Types.ObjectId(fileId) });

    if (fileResult.deletedCount === 0) {
      throw new Error(`File not found for id ${fileId}`);
    }

    res.status(httpStatus.OK).json({ message: 'File deleted successfully' });

  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

// delete files from database provided with fileIds
const deleteFiles = async (req, res) => {
  try {
    let { fileIds } = req.body; // ids of the files to be deleted (passed as an array of fileIds in the request body)
    fileIds = JSON.parse(fileIds);
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'storage',
    });

    if (!fileIds || fileIds.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'No file IDs provided for deletion' });
    }

    const db = mongoose.connection.db;
    const fileCollection = db.collection('storage.files');
    const chunksCollection = db.collection('storage.chunks');

    const deleteFile = async (fileId) => {
      const fileResult = await fileCollection.deleteOne({ _id: new mongoose.Types.ObjectId(fileId) });
      await chunksCollection.deleteMany({ files_id: new mongoose.Types.ObjectId(fileId) });

      if (fileResult.deletedCount === 0) {
        throw new Error(`File not found for id ${fileId}`);
      }
    };

    await Promise.all(fileIds.map(deleteFile));

    res.status(httpStatus.OK).json({
      message: 'Files deleted successfully',
      deletedFilesCount: fileIds.length,
    });

  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
  }
};

module.exports = {
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
  getFilesByUsage
};