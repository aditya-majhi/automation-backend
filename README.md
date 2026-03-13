# SaaS Automation Recorder

## Overview
The SaaS Automation Recorder is a platform designed to automate the recording of various software testing processes. It provides a robust backend built with Node.js, Express, and PostgreSQL, utilizing Prisma ORM for database interactions and JWT for secure authentication.

## Features
- User registration and authentication
- Recording management for test cases
- Middleware for error handling and request validation
- Type-safe schemas using Zod
- Secure password storage with Bcrypt

## Technologies Used
- **Node.js**: JavaScript runtime for building the backend
- **Express**: Web framework for building APIs
- **PostgreSQL**: Relational database for storing application data
- **Prisma**: ORM for database interactions
- **JWT**: For secure user authentication
- **Bcrypt**: For hashing passwords
- **Zod**: For request validation
- **TypeScript**: For type safety and better development experience

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- PostgreSQL (version 12 or higher)
- A package manager like npm or yarn

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd saas-automation-recorder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the environment variables:
   - Copy the `.env.example` to `.env` and fill in the required values, such as database connection strings and JWT secrets.

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the application:
   ```
   npm run start
   ```

### API Endpoints
- **Authentication**
  - `POST /auth/register`: Register a new user
  - `POST /auth/login`: Log in an existing user

- **User Management**
  - `GET /users/:id`: Retrieve user details

- **Recording Management**
  - `POST /recordings`: Create a new recording
  - `GET /recordings/:testCaseId`: Retrieve recordings by test case ID

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.