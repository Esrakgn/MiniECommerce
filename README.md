# MiniECommerce

MiniECommerce is a learning-focused backend project built with ASP.NET Core Web API to practice layered architecture, JWT authentication, role-based authorization, validation, exception handling, logging, and MSSQL database integration.

It includes product CRUD operations, category support, search, filtering, sorting, pagination, centralized exception handling with custom status codes, and Serilog logging with console and file output.

## Project Structure

- `MiniECommerce.API`: controllers, middleware, JWT setup, Serilog, Swagger, and application startup
- `MiniECommerce.Application`: DTOs, interfaces, validation rules, and custom exceptions
- `MiniECommerce.Domain`: core entities and shared domain models
- `MiniECommerce.Infrastructure`: EF Core database context and service implementations

## Technologies Used

- ASP.NET Core Web API
- Entity Framework Core
- MSSQL
- JWT Bearer Authentication
- FluentValidation
- Serilog
- Swagger / OpenAPI

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

The product listing endpoint supports category filtering, search by name and description, price range filtering, stock filtering, sorting, and pagination.

## How to Run

1. Clone the repository
2. Open the solution in Visual Studio
3. Update the SQL Server connection string in `appsettings.json` if needed
4. Run EF Core migrations or update the database
5. Start the `MiniECommerce.API` project
6. Open Swagger and test the endpoints
