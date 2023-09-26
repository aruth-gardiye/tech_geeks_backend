// Express server for the API
// Path: server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
const status = require('http-status');
// const routes = require('./dummyRoutes.js'); // change later to routes/
const routes = require('./routes');
const mongoose = require('mongoose');
const app = express(); 

// cors
app.use(cors({ origin: true, credentials: true }));


// rotate log to 'server_logs/access.log'
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'server_logs')
})


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: accessLogStream }))


//routes
app.use('/', routes);


//error handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = status.NOT_FOUND;
  next(error);
});


app.use((error, req, res, next) => {
  res.status(error.status || status.INTERNAL_SERVER_ERROR);
  res.json({
    error: {
      message: error.message
    }
  });
});


// connect to mongodb
mongoose.connect(process.env.MDB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// start server
const port = process.env.PORT || 3001;

// enable trust proxy
app.enable('trust proxy');

app.listen(port, () => console.log(`Server started on port ${port}`));

module.exports = app;