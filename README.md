# Book Rental System

The Book Rental System is a web application that allows users to manage and search for books. It provides features such as listing all books, searching for books by title or author, and renting/returning books.

## System Architecture

The system is built using the following technologies:

- Node.js: A JavaScript runtime for server-side development.
- Nest.js: A progressive Node.js framework for building efficient and scalable web applications.
- Prisma: A modern database toolkit for TypeScript and Node.js that simplifies database access.

The application follows a layered architecture, separating concerns into modules, controllers, services, and data access layers. It uses RESTful API endpoints to handle requests and responses.

## Prerequisites

Before running the application, make sure you have the following installed on your machine:

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Docker for (PostgreSQL database)

## Installation

Follow these steps to set up and run the application:

1. Clone the repository: `git clone https://github.com/rvslan/book-rental-app`
2. Navigate to the project directory: `cd book-rental-app`
3. Install dependencies: `npm install`
4. Run docker: `docker compose up -d`

## Configuration

Before running the application, you need to configure the database connection. Open the `.env` file in the project root directory and update the database credentials:

    NODE_ENV=testing
    APP_PORT=3000
    AT_SECRET=at-secret
    RT_SECRET=rt-secret
    SALT_ROUNDS=10
    DATABASE_URL="postgresql://postgres:123@localhost:5432/nestjs?schema=public"


## Database Migration

The application uses Prisma for database access and management. To migrate the database schema, run the following command:

    npx prisma migrate dev

This will create the necessary tables and relationships in the database.

## Database Seeder

To migrate the database seeders with book stores/books, run the following command:

    npx prisma db seed

This will create the necessary dummy data in the database.

## Running the Application

To start the application, run the following command:

    npm run start:dev


The application will start on http://localhost:3000 by default. You can access the API endpoints using a tool like Postman or through a web browser.

## Running Tests

The application includes unit tests and integration tests to ensure its correctness. To run the tests, use the following command:

    #unit tests
    npm run test
    
    #e2e tests
    npm run test:e2e


This will execute all the test cases and display the results.

## API Documentation

The API documentation is generated using Swagger. You can access the documentation by visiting http://localhost:3000/docs in your web browser. It provides detailed information about each API endpoint, including request and response examples.

## Note: Future Enhancements

	- Elasticsearch integration for advanced book search capabilities 
	- Sentry integration for error handling and monitoring
	- CloudWatch integration for comprehensive error monitoring and log analysis



