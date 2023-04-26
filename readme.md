# ProjectEase Backend

## Description

ProjectEase is an application that manages projects for teams. This repository contains the backend of the application which connects to the database and offers an API for the frontend. The API has routes for users, teams, projects, tasks, and comments. Each team has members, each team has projects, each project has tasks, and each task and project has comments.

## API Documentation

The API documentation for this project can be found [here](https://documenter.getpostman.com/view/24815633/2s93Y6tKGX). Please refer to this documentation for detailed information on each endpoint, request and response format, and authentication requirements.

## Deployment

The app is deployed on Heroku and the database is hosted on Atlas.
you can access the app at https://project-ease.herokuapp.com/api

## Technologies

The backend is built using Node.js, Express.js, and MongoDB. The following Node.js libraries are used

- bcrypt
- compression
- config
- cors
- express
- helmet
- joi
- joi-objectid
- jsonwebtoken
- mongoose

## API Endpoints

The API endpoints are documented in the API documentation, which is hosted on Postman and can be found [here](https://documenter.getpostman.com/view/24815633/2s93Y6tKGX).

## Installation

1. Clone the repository
2. Run `npm install`

## Usage

1. Run `npm start` to start the server.
2. Use the API endpoints to interact with the backend. Refer to the API documentation for more information.

## Authentication

Authentication is done using JSON Web Tokens (JWT). To create an account, make a POST request to the `/users` endpoint. Then, make a POST request to the `/auth` endpoint with your credentials to receive an `x-auth-token` in the response header. This token should be included in subsequent requests to identify the user.

## Authorization

Authorization is implemented using middleware functions. For example, editing a project in a team cannot be done unless the user is a member of the team. Authorization requirements are specified in the API documentation.

## Tests

The backend has a comprehensive test suite with 173 tests written using Jest. To run the tests, run `npm test`.

## Contributing

Contributions are welcome! Please submit a pull request for any changes or additions.
