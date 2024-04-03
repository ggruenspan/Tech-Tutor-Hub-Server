# Tech Tutor Hub (Server)

## Overview

Tech Tutor Hub is an ongoing project aimed at developing a web application that facilitates finding a tutor tailored to users' specific needs. The primary technologies utilized in this project include Node.js for the back end and MongoDB for the database. Robust security measures are implemented for user authentication and the sign-up/sign-in/sign-out processes.

## Technologies Used
  - [Node.js] - A JavaScript runtime built on Chrome's V8 JavaScript engine, providing an efficient and scalable server environment.
  - [Express] - A fast, unopinionated, minimalist web framework for Node.js.
  - [Body-Parser] - Node.js body parsing middleware.
  - [Cors] - Express middleware to enable CORS (Cross-Origin Resource Sharing).
  - [Passport] - Express-compatible authentication middleware for Node.js.
  - [Express-Session] - Session middleware for Express.
  - [MongoDB] - A NoSQL database used for storing and retrieving user information.

## Features
- **Secure Authentication:**
  - Implemented secure sign-up and sign-in/out processes to ensure user data integrity.

- **Scalable Database:**
  - Utilized Mongoose for managing user data, providing scalability as the user base grows.

## Deployment

The application is planned to be Dockerized to ensure scalability and easy deployment across different environments.

## Getting Started

To get started with the development of Tech Tutor Hub server-side, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/ggruenspan/tech-tutor-hub-server.git
   cd tech-tutor-hub-server
    ```
2. Install Dependencies
    ```bash
    # Install dependencies
    npm install
    ```
3. Download the Client Repository:

To complete the application, you'll need to download and set up the client side of Tech Tutor Hub. Follow the instructions in the [Client Repository] to get started.

6. Run the application
    ```bash
    # Make sure you have your .env file in the same folder
    cd server
    npm run devStart
    ```

## License

MIT

**Free Software, Hell Yeah!**

   [Node.js]: <http://nodejs.org>
   [Express]: <https://expressjs.com/>
   [Body-Parser]: <https://www.npmjs.com/package/body-parser>
   [Cors]: <https://www.npmjs.com/package/cors>
   [Passport]: <https://www.passportjs.org/>
   [Express-Session]: <https://www.npmjs.com/package/express-session>
   [MongoDB]: <https://www.mongodb.com/>
   [Medium.com]: <https://medium.com/@tuanhuyngt/using-https-in-development-with-react-js-5388bf7278de>
   [Client Repository]: <https://github.com/ggruenspan/Tech-Tutor-Hub-Client>
