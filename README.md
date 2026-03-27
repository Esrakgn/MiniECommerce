# MiniECommerce

MiniECommerce is a learning-focused backend project built with ASP.NET Core Web API. It was created to practice core backend concepts such as layered architecture, JWT authentication, authorization, claims, validation, and database integration with MSSQL.

## Features

- Layered architecture
- JWT authentication
- Authorization with protected endpoints
- Claims-based identity
- FluentValidation
- Entity Framework Core
- MSSQL database connection
- Product listing, creation, and detail endpoints
- Pagination
- Basic error handling

## Project Structure

### `MiniECommerce.API`
Contains controllers, application startup configuration, authentication setup, and Swagger configuration.

### `MiniECommerce.Application`
Contains DTOs, interfaces, and validation logic.

### `MiniECommerce.Domain`
Contains core entities and shared domain models.

### `MiniECommerce.Infrastructure`
Contains database context and service implementations.

## Technologies Used

- ASP.NET Core Web API
- Entity Framework Core
- MSSQL
- JWT Bearer Authentication
- FluentValidation
- Swagger / OpenAPI

## Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`

## Authentication Flow

- `Register` creates a new user
- `Login` returns a JWT token
- Protected endpoints require a valid token
- The token can be added from Swagger using the `Authorize` button

## How to Run

1. Clone the repository
2. Open the solution in Visual Studio
3. Update the SQL Server connection string in `appsettings.json`
4. Run the migration commands or update the database
5. Start the `MiniECommerce.API` project
6. Open Swagger and test the endpoints

## Learning Purpose

This project was built to better understand:

- The difference between authentication and authorization
- How JWT tokens work
- How claims are used
- How to validate incoming requests
- How layered architecture is structured
- How a backend project connects to a database
