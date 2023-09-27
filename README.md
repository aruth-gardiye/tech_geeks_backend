# Server for Tech Geeks Prototype Platform

This folder contains the server for the TechGeeks prototype platform. The server is built using Node.js and Express.

## Getting Started

Add a `.env` file to the root of the server directory mirroring the `.env.example` file. The `.env` file should contain the following:

```
PORT = 3001
MDB_URI = "YOUR_MONGODB_URI"
MAPBOX_TOKEN = "YOUR_MAPBOX_TOKEN"
```

The `PORT` port is the port that the server will be running on. The `MDB_URI` is the URI used to connect to the MongoDB database.

Run the following commands after navigating to the root directory:

```
npm install
npm run start
```

This will install the necessary dependencies and start the server. The server will be running on [http://localhost:3001](http://localhost:3001) with default settings.

## API Documentation

User documentation can be found in the [docs/User.md](docs/User.md) file.
Job documentation can be found in the [docs/Job.md](docs/Job.md) file.
Help documentation can be found in the [docs/Help.md](docs/Help.md) file.