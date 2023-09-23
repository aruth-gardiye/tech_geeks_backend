# Server for Tech Geeks Prototype Platform

This folder contains the server for the TechGeeks prototype platform. The server is built using Node.js and Express.

## Getting Started

Add a `.env` file to the root of the server directory mirroring the `.env.example` file. The `.env` file should contain the following:

```
EXPRESS_API_PORT = 3001
MDB_URI = "YOUR_MONGODB_URI"
```

The `EXPRESS_API_PORT` port is the port that the server will be running on. The `MDB_URI` is the URI used to connect to the MongoDB database.

Run the following commands after navigating to the 'server' directory:

```
npm install
npm run start
```

This will install the necessary dependencies and start the server. The server will be running on [http://localhost:3001](http://localhost:3001) with default settings.