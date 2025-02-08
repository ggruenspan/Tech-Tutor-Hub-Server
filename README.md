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

### 1️⃣ Clone the repository:

   ```bash
   git clone https://github.com/ggruenspan/tech-tutor-hub-server.git
   cd tech-tutor-hub-server
   ```

### 2️⃣ Install Dependencies

   ```bash
   npm install
   ```

## 🚨 Environment Configuration (Required)
Before running the application, you must create a `.env` file in the project root directory.  
The application **will not run** unless this file is created and contains the necessary secrets and credentials.

Your `.env` file should include:

   ```plaintext
   MONGODB_CONN_STR=your_mongodb_connection_string
   PORT=8080
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_secret_key
   CRYPTO_SECRET=your_crypto_secret
   EMAIL_USER=your_email_user
   EMAIL_PASSWORD=your_email_password
   ```

Make sure to replace the placeholder values with your actual database credentials and security secrets.

## 🔒 Running the Application on HTTPS
To run the application on HTTPS, follow these steps from [Medium.com]:

1. Open **PowerShell** as administrator and check the execution policy:
   ```bash
   Get-ExecutionPolicy 
   ```
   If it returns **Restricted**, then run:
   ```bash
   Set-ExecutionPolicy AllSigned or Set-ExecutionPolicy Bypass -Scope Process.
   ```
2. Install **Chocolatey**:
   ```bash
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. Install **mkcert** using Chocolatey:
   ```bash
   choco install mkcert
   ```
4. Create a trusted certificate authority in your system’s root store:
   ```bash
   mkcert -install
   ```
5. Generate valid HTTPS certificates for localhost:
   ```bash
   # Create a folder in the main directory called 'ssl'
   mkcert localhost
   ```

## 🎨 Download the Client Repository:

To complete the application, you'll need to download and set up the client side of Tech Tutor Hub. Follow the instructions in the [Client Repository] to get started.

## ▶️ Running the Application

Once the `.env` file is set up, you can start the server:

   ```bash
   # Make sure you have your .env file in the same folder
   cd server
   npm run devStart
   ```

## 📜 License

MIT

**Free Software, Hell Yeah!** 🚀

[Node.js]: <http://nodejs.org>  
[Express]: <https://expressjs.com/>  
[Body-Parser]: <https://www.npmjs.com/package/body-parser>  
[Cors]: <https://www.npmjs.com/package/cors>  
[Passport]: <https://www.passportjs.org/>  
[Express-Session]: <https://www.npmjs.com/package/express-session>  
[MongoDB]: <https://www.mongodb.com/>  
[Medium.com]: <https://medium.com/@tuanhuyngt/using-https-in-development-with-react-js-5388bf7278de>  
[Client Repository]: <https://github.com/ggruenspan/Tech-Tutor-Hub-Client>  
