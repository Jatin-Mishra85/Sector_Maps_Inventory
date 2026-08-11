Summary: This document explains what the project is, its main purpose, and the high-level frontend/backend architecture.

# Overview

Sector Maps Inventory is a real estate inventory management tool built to manage properties, developers, sectors, and project listings. It appears focused on allowing inventory items to be added in bulk, grouped/tagged, searched, saved, and reported.

## Purpose

- Manage real estate inventory data for developers and projects.
- Store inventory items with associated developer, sector, project, price, area, status, image, and group tags.
- Provide a frontend UI for browsing, searching, grouping, and saving listings.
- Support admin actions like adding inventory, verifying access codes, and deleting listings.
- Allow users to login with Google for saved items and reporting.

## Tech Stack

- Frontend:
  - React 19
  - Vite 8
  - React Router DOM 7
  - React Hook Form
  - React Icons
  - react-easy-crop
  - @react-oauth/google
  - Axios

- Backend:
  - Node.js
  - Express
  - MSSQL (`mssql` package)
  - Azure Blob Storage (`@azure/storage-blob`)
  - Google OAuth (`google-auth-library`)
  - JWT (`jsonwebtoken`)
  - Multer for file uploads
  - Helmet, CORS, cookie-parser, morgan

- Deployment:
  - Frontend appears intended for Vite deployment (possible Vercel production hosting mentioned in user request, but config uses local dev proxy and dynamic host detection).
  - Backend uses environment-based config and Azure Blob Storage for images.

## High-level Architecture

Frontend and backend are separate applications inside the repository.

Frontend folder structure flows like this:
- `src/main.jsx` → bootstraps app
- `src/app/App.jsx` → wraps app providers and routes
- `src/routes/AppRoutes.jsx` → defines route pages inside `MainLayout`
- `src/pages/*` → page-level screens
- `src/features/*` → feature modules for inventory, developer grouping, admin, search
- `src/components/*` → reusable UI components and common widgets
- `src/context/*` → global app context providers
- `src/services/*` → shared http client and error handling
- `src/constants/*`, `src/hooks/*`, `src/utils/*`

Backend folder structure flows like this:
- `src/server.js` → starts the server and database connection
- `src/app.js` → initializes express, middleware, routes and error handling
- `src/routes/index.routes.js` → mounts feature routes under `/api/v1`
- `src/controllers/*` → request handlers
- `src/services/*` → business logic and validation
- `src/repositories/*` → raw SQL database access
- `src/database/connection.js` → MSSQL pool management
- `src/config/*` → environment, DB, multer, Azure Blob settings
- `src/middleware/*` → auth, logging, not-found, error handlers

## Text-based Folder Flow

Frontend:
- `main.jsx` → `App.jsx` → `AppProviders.jsx` → `AppRoutes.jsx` → page component
- Page component → feature hooks/services/components
- Feature services use `src/services/apiClient.js` and `src/constants/apiEndpoints.js`

Backend:
- `server.js` → `connectDB()` → launches `app.js`
- `app.js` → global middleware → `routes/index.routes.js`
- `index.routes.js` → `/api/v1/*` routes
- route file → specific controller
- controller → service
- service → repository + DB
- repository → direct MS SQL queries

## Notes

- The backend uses both cookie-based auth and JWT stored in cookie `auth_token`.
- Images are uploaded via multer memory storage and then uploaded to Azure Blob.
- Some frontend features are marked as temporary or in-progress.
