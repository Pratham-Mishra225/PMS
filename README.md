# Pharmacy Management System (PMS)

A full-stack Pharmacy Management System built as an Industry Practices project for college assessment.

The application demonstrates role-based access control, secure session authentication, inventory tracking, and point-of-sale operations with a modern frontend and Java Spring backend.

## Project Context

This repository is submitted as an Industry Practices assessment project. It focuses on practical software engineering standards such as:

- Clear project structure and separation of concerns
- Secure authentication and authorization patterns
- Environment-based configuration
- API-first backend design
- Reproducible local setup and documentation

## Key Features

- Secure login with Spring Security session authentication
- Role-based authorization (ADMIN and PHARMACIST)
- Inventory management: add, edit, search, low-stock, and expiring-soon tracking
- POS module for sales processing
- Seeded demo users and starter medicine data
- CSRF protection and CORS configuration for SPA integration

## Tech Stack

Backend
- Java 21
- Spring Boot 3.4
- Spring Web, Spring Data JPA, Spring Security, Bean Validation
- MySQL

Frontend
- React 18
- Vite 5
- Axios
- React Router
- Bootstrap 5

## Architecture

- Frontend SPA runs on localhost (Vite dev server)
- Backend REST API runs on Spring Boot
- Authentication uses server-side session with cookie-based CSRF support
- Persistent data stored in MySQL database

## Repository Structure

```text
PMS/
	frontend/                        React + Vite client
		src/
			components/
			pages/
			api.js
	src/main/java/org/example/pms/  Spring Boot backend
		controller/
		service/
		repository/
		entity/
		security/
	src/main/resources/
		application.properties
	pom.xml
	QUICK_START.md
	start-backend.bat
```

## Prerequisites

- Java 21
- Node.js 18+ and npm
- MySQL 8+

## Environment Configuration

### 1) Backend database password

Set the DB password as an environment variable before starting backend:

Windows PowerShell

```powershell
$env:DB_PASSWORD="your_mysql_password"
```

Linux/macOS

```bash
export DB_PASSWORD="your_mysql_password"
```

Backend default database settings:

- URL: jdbc:mysql://localhost:3306/pharmacy_db
- Username: root
- Password source: DB_PASSWORD environment variable (fallback exists for local convenience)

### 2) Frontend API URL

Create frontend/.env from frontend/.env.example:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Local Setup and Run

### 1) Clone and open project

```bash
git clone https://github.com/Pratham-Mishra225/PMS.git
cd PMS
```

### 2) Create database

Create an empty MySQL database named pharmacy_db.

### 3) Run backend

Windows

```powershell
./mvnw.cmd spring-boot:run
```

Linux/macOS

```bash
./mvnw spring-boot:run
```

Alternative (Windows): run start-backend.bat.

### 4) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev URL is typically http://localhost:5173.

## Default Demo Accounts

Seeded on startup when users do not exist:

- Admin
	- Username: admin
	- Password: admin123
- Pharmacist
	- Username: test
	- Password: test123

## API Summary

Auth
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/auth/csrf

Medicines
- GET /api/medicines
- GET /api/medicines/{id}
- POST /api/medicines
- PUT /api/medicines/{id}
- DELETE /api/medicines/{id} (ADMIN only)
- GET /api/medicines/search?name={name}
- GET /api/medicines/low-stock
- GET /api/medicines/expiring-soon

Sales
- POST /api/sales
- GET /api/sales

## Build and Test

Backend tests

```bash
./mvnw test
```

Frontend production build

```bash
cd frontend
npm run build
```

## Security Notes

- Session-based authentication with secure context persistence
- BCrypt password hashing
- CSRF token support for SPA requests
- CORS restricted to local frontend origins used in development

## Troubleshooting

- Backend not reachable: verify Spring Boot is running on port 8080
- Frontend API errors: verify frontend/.env contains correct VITE_API_BASE_URL
- DB connection errors: verify MySQL service is running and DB_PASSWORD is set
- Unauthorized after login: clear browser cookies and retry

## Assessment Note

This project is submitted for academic evaluation under the Industry Practices course component. It demonstrates practical application of full-stack development standards including security, documentation, and maintainable project structure.

## Author

Pratham Mishra
