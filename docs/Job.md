
# Job Workflow

## Expected:

1. Client creates job details
2. Job status gets submitted with 'available'
3. Providers bid on the job
4. Providers bid gets submitted with 'submitted'
5. Client selects a bid
6. Job status gets updated to 'accepted' and matching bid is updated to 'accepted'
7. Selected provider opted to be assigned to the job
8. Job status gets updated to 'assigned' and matching bid is updated to 'assigned'
9. Client updates the job to 'in-progress'
10. Job status gets updated to 'in-progress'
11. Client updates the job to 'completed'
12. Job status gets updated to 'completed'


## Constraints

- **Client**
	- Need to select a bid before changing job status to something other than 'available' or 'cancelled'
	- Current Job status needs to be 'assinged' before changing new job status to 'in-progress'
	- Current Job status needs to be 'in-progress' before changing new job status to 'completed'
	- Can cancel job only if current job status is 'available, 'accepted', and 'assigned'.
- **Provider**
	- Submitted bid must be same or below the jobPrice
	- Can only bid on jobs with status 'available', 'accepted'
	- Can only update bid amount if bidStatus is 'submitted', or 'stale', stale happens when client updated the jobPrice to something higher than original provider bid.
	- Can only opted to be assigned to job if job's selectedBid matches providers userId (_id) and job status is 'accepted'
	- Can withdraw bid only if job status is 'available', 'accepted' or 'assigned' and selectedBid matches providers userId(_id)
  

# Job API Documentation

## Create a New Job

**Route**: `/api/Job/createJob`

**HTTP Method**: `POST`

### Description

Create a new job posting with the specified details.

### Request Body

The request body should contain the following required fields:

-  `jobName` (string): The name of the job.

-  `jobDescription` (string): A brief description of the job.

-  `jobType` (string): The type of job (e.g., "full-time", "part-time", etc.).

-  `jobLocation` (object): The location of the job, including an address, longitude, and latitude.

-  `jobStartDate` (string): The start date of the job in the format "YYYY-MM-DD".

-  `jobEndDate` (string): The end date of the job in the format "YYYY-MM-DD".

-  `jobStatus` (string): The status of the job (e.g., "available", "closed", etc.).

-  `jobPrice` (number): The price or compensation for the job.

-  `jobOwner` (string): The ID of the job owner.

#### Example Request Body

```json
{

"jobName": "Job Name",

"jobDescription": "Job Description",

"jobType": "full-time",

"jobLocation": {

"address": "Job Address",

"longitude": 153.616961,

"latitude": -28.652513

},

"jobStartDate": "2020-11-01",

"jobEndDate": "2020-11-02",

"jobStatus": "available",

"jobPrice": 100,

"jobOwner": "5f9f4f8c8f5c9a3c3c7c1b0b"
}
```

## Update a Job by Client

**Route**: `/api/Job/updateJob`

**HTTP Method**: `PATCH`

### Description

Update specific details of a job by a client. The client can update various fields of the job using this route.

### Request Body

The request body should contain the following fields:

-  `jobId` (string): The ID of the job to update (required).

-  `jobName` (string): The updated name of the job (optional).

-  `jobDescription` (string): The updated description of the job (optional).

-  `jobType` (string): The updated type of the job (optional).

-  `jobLocation` (object): The updated location of the job, including an address, longitude, and latitude (optional).

-  `jobStartDate` (string): The updated start date of the job in the format "YYYY-MM-DD" (optional).

-  `jobEndDate` (string): The updated end date of the job in the format "YYYY-MM-DD" (optional).

-  `selectedBid` (string): The ID of the selected bid (optional).

-  `jobStatus` (string): The updated status of the job (optional). Valid values: "available," "accepted," "in-progress," "completed," "cancelled."

-  `jobPrice` (number): The updated price or compensation for the job (optional).

-  `jobOwner` (string): The ID of the job owner (optional).

#### Example Request Body

```json
{

"jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",

"jobName": "Updated Job Name",

"jobDescription": "Updated Job Description",

"jobType": "part-time",

"jobLocation": {

"address": "Updated Job Address",

"longitude": 153.616961,

"latitude": -28.652513

},

"jobStartDate": "2022-01-01",

"jobEndDate": "2022-01-15",

"selectedBid": "5f9f4f8c8f5c9a3c3c7c1b0c",

"jobStatus": "in-progress",

"jobPrice": 150,

"jobOwner": "5f9f4f8c8f5c9a3c3c7c1b0b"

}
```

## Submit a Bid for a Job

**Route**: `/api/Job/submitBid`

**HTTP Method**: `PATCH`

### Description

Submit a bid for a specific job. Providers can submit bids for jobs with the specified details.

### Request Body

The request body should contain the following required fields:

-  `jobId` (string): The ID of the job for which the bid is being submitted.

-  `userId` (string): The ID of the user submitting the bid.

-  `bid` (number): The bid amount.

Additionally, you can include the optional field:

-  `bidStatus` (string): The status of the bid (optional). Valid values: "submitted"

#### Example Request Body

```json
{

"jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",

"userId": "5f9f4f8c8f5c9a3c3c7c1b0c",

"bid": 100,

"bidStatus": "submitted"

}
```

## Update a Bid for a Job

**Route**: `/api/Job/updateBid`

**HTTP Method**: `PATCH`

### Description

Update a bid for a specific job. Providers can update various details of their bid for a job using this route.

### Request Body

The request body should contain the following required fields:

-  `jobId` (string): The ID of the job for which the bid is being updated.

-  `userId` (string): The ID of the user whose bid is being updated.

Additionally, you can include the optional fields:

-  `bid` (number): The updated bid amount (optional).

-  `bidStatus` (string): The updated status of the bid (optional). Valid values: "submitted," "assigned," "withdrawn."

#### Example Request Body

```json
{

"jobId": "5f9f4f8c8f5c9a3c3c7c1b0b",

"userId": "5f9f4f8c8f5c9a3c3c7c1b0c",

"bidStatus": "assigned"

}
```
  

## Get All Jobs by Client

**Route**: `/api/Job/getAllJobsByClient/:userId`

**HTTP Method**: `GET`

### Description

Retrieve all jobs associated with a specific client identified by their user ID.

### Request Parameters

The request URL should include the following required parameter:

-  `userId` (string): The ID of the client for whom you want to retrieve jobs.

#### Example Request URL

```http

GET http://localhost:3001/api/Job/getAllJobsByClient/5f9f4f8c8f5c9a3c3c7c1b0b

```
  

## Get All Jobs Bid by Service Provider

**Route**: `/api/Job/getAllJobsByServiceProvider/:userId`

**HTTP Method**: `GET`

### Description

Retrieve all jobs for which a specific service provider has submitted bids. The service provider is identified by their user ID.

### Request Parameters

The request URL should include the following required parameter:

-  `userId` (string): The ID of the service provider for whom you want to retrieve jobs with bids.

#### Example Request URL

```http

GET http://localhost:3001/api/Job/getAllJobsByServiceProvider/5f9f4f8c8f5c9a3c3c7c1b0b

```
  

## Get All Jobs

**Route**: `/api/Job/getAllJobs`

**HTTP Method**: `GET`

### Description

Retrieve all available jobs.

### Request

No request parameters are required for this endpoint.

#### Example Request URL

```http

GET http://localhost:3001/api/Job/getAllJobs

```
  

## Get Job by ID

**Route**: `/api/Job/getJobById/:jobId`

**HTTP Method**: `GET`

### Description

Retrieve a specific job by its unique ID.

### Request Parameters

The request URL should include the following required parameter:

-  `jobId` (string): The ID of the job you want to retrieve.

#### Example Request URL

```http

GET http://localhost:3001/api/Job/getJobById/5f9f4f8c8f5c9a3c3c7c1b0b

```
  

## Delete a Job

**Route**: `/api/Job/deleteJob`

**HTTP Method**: `DELETE`

### Description

Delete a specific job by its unique ID.

### Request Body

The request body should contain the following required field:

-  `jobId` (string): The ID of the job you want to delete.

#### Example Request Body

```json
{

"jobId": "5f9f4f8c8f5c9a3c3c7c1b0b"

}
```
