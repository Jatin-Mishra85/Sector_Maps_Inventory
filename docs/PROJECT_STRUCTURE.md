# Project Structure Documentation

## Overview

Sector Maps Inventory is a full-stack web application built with **Node.js + Express** (backend) and **React + Vite** (frontend). It's designed to help manage and browse a catalog of real estate inventory items organized by developers, sectors, projects, and custom groupings.

The system has multiple user roles:
- **Regular Users**: Can browse inventory, search, save/bookmark items, and submit feedback
- **Admin Users**: Can create, edit, and delete inventory items; manage groups
- **SuperAdmin Users**: Can manage all users (promote to admin, block users)

---

## Backend Structure (`/backend`)

The backend is organized using the **MVC (Model-View-Controller) + Service + Repository** pattern, which separates concerns into layers:

### Core Startup Files

- **`src/server.js`**: Starts the Express server, connects to the database, and handles graceful shutdown
- **`src/app.js`**: Configures Express middleware (CORS, helmet, JSON parsing), sets up global error handling, and mounts all routes
- **`package.json`**: Lists dependencies (Express, mssql, jwt, bcrypt, nodemailer, etc.)

### Configuration Files (`src/config/`)

- **`app.config.js`**: Loads environment variables and exports configuration (port, environment mode, app name)
- **`db.config.js`**: SQL Server database connection configuration
- **`azureBlob.config.js`**: Azure Blob Storage configuration for uploading images to the cloud
- **`multer.config.js`**: File upload middleware configuration
- **`logger.config.js`**: Logging service setup

### Database Layer (`src/database/`)

- **`connection.js`**: Manages SQL Server connection pool; provides `getPool()` function used across the app to get database access
- **`migrations/`**: SQL migration scripts to set up the database schema
- **`procedures/`**: Stored procedures (if any)
- **`seeders/`**: Test data seeders (if any)

### Controllers (`src/controllers/`)

Controllers handle HTTP requests and responses. Each controller maps to a resource:

- **`auth.controller.js`**: Handles login/signup (Google OAuth, email/password), logout, and fetching current user
- **`inventory.controller.js`**: Handles fetching, creating, updating, and deleting inventory items; manages image uploads
- **`admin.controller.js`**: Handles superadmin operations like fetching all users and toggling admin/block status
- **`search.controller.js`**: Handles inventory search and suggestions
- **`group.controller.js`**: Manages custom groups (tags); allows adding/removing inventories to groups
- **`developer.controller.js`**: CRUD for developers (companies building projects)
- **`sector.controller.js`**: CRUD for sectors (geographic areas)
- **`project.controller.js`**: CRUD for projects (developments within sectors)
- **`interactions.controller.js`**: Handles user interactions: saving/bookmarking inventories, reporting problematic items
- **`feedback.controller.js`**: Handles user feedback submission and retrieval
- **`image.controller.js`**: Handles image-related operations

### Services (`src/services/`)

Services contain the business logic. They are called by controllers and call repositories:

- **`auth.service.js`**: Verifies Google tokens, hashes passwords, generates JWT tokens, creates/retrieves users
- **`inventory.service.js`**: Validates inventory data, checks for duplicate card numbers, delegates to repository
- **`admin.service.js`**: Fetches users and toggles admin/block status
- **`search.service.js`**: Searches inventories by keyword and type
- **`group.service.js`**: Manages group operations (create, update, delete, add/remove inventories)
- **`developer.service.js`**: Developer CRUD business logic
- **`sector.service.js`**: Sector CRUD business logic
- **`project.service.js`**: Project CRUD business logic
- **`interactions.service.js`**: Manages saved inventories and inventory reports
- **`feedback.service.js`**: Handles feedback storage and retrieval
- **`email.service.js`**: Sends email notifications (via Nodemailer)
- **`image.service.js`**: Image processing and management

### Repositories (`src/repositories/`)

Repositories handle all direct database queries. They:
- Accept clean input from services
- Execute SQL queries using the connection pool
- Return raw database results (PascalCase column names from SQL)

Each repository file corresponds to a resource:

- **`auth.repository.js`**: User lookups and creation (by Google ID, email, or ID)
- **`inventory.repository.js`**: All inventory queries; manages Developer/Sector/Project/Group lookups; handles image associations
- **`admin.repository.js`**: User queries for management
- **`search.repository.js`**: Search queries
- **`group.repository.js`**: Group queries and inventory-group associations
- **`developer.repository.js`**: Developer queries
- **`sector.repository.js`**: Sector queries
- **`project.repository.js`**: Project queries
- **`interactions.repository.js`**: Saved inventories and report storage
- **`feedback.repository.js`**: Feedback storage and retrieval
- **`image.repository.js`**: Image record management

### Routes (`src/routes/`)

Routes define API endpoints:

- **`index.routes.js`**: Main router that imports and mounts all feature routes
- **`auth.routes.js`**: POST `/auth/google`, `/auth/signup`, `/auth/login`; GET `/auth/me`; POST `/auth/logout`
- **`inventory.routes.js`**: GET/POST `/inventories`, GET/PUT/DELETE `/inventories/:id`, GET `/inventories/next-card-number`
- **`admin.routes.js`**: Superadmin endpoints for user management
- **`search.routes.js`**: GET search and suggestions endpoints
- **`group.routes.js`**: Group CRUD and bulk operations
- **`developer.routes.js`**: Developer CRUD
- **`sector.routes.js`**: Sector CRUD
- **`project.routes.js`**: Project CRUD
- **`interactions.routes.js`**: Bookmark/save and report endpoints
- **`feedback.routes.js`**: Feedback submission and retrieval
- **`image.routes.js`**: Image operations

### Middleware (`src/middleware/`)

Middleware functions intercept requests:

- **`auth.middleware.js`**: 
  - `attachUser`: Reads JWT token from cookies, verifies it, and attaches user object to `req.user`
  - `requireAuth`: Ensures user is logged in
  - `requireAdmin`: Ensures user has admin privileges
- **`error.middleware.js`**: Catches errors and returns standardized error responses
- **`notFound.middleware.js`**: Handles 404 requests (undefined routes)
- **`requestLogger.middleware.js`**: Logs incoming requests (using Morgan)
- **`requireSuperAdmin.js`**: Ensures user is superadmin

### Utilities (`src/utils/`)

- **`apiResponse.util.js`**: Helper class to format API responses (success/error)
- **`apiError.util.js`**: Custom error class for consistent error handling
- **`asyncHandler.util.js`**: Wrapper to catch errors in async route handlers
- **`logger.util.js`**: Logging utility for error and info messages

### Constants (`src/constants/`)

- **`httpStatusCodes.constant.js`**: HTTP status code mappings (200, 400, 401, 403, etc.)
- **`messages.constant.js`**: Reusable success/error message strings

### Validators (`src/validators/`)

- **`baseValidator.util.js`**: Base validation utilities
- **`inventory.validator.js`**: Inventory-specific validation rules

### Documentation (`src/docs/`)

- **`swagger.yaml`**: OpenAPI/Swagger specification for API documentation

---

## Frontend Structure (`/frontend`)

The frontend is a single-page application built with React and Vite. It uses file-based routing with React Router.

### Entry Point

- **`index.html`**: Root HTML file; loads the React app into a div with id `root`
- **`main.jsx`**: Initializes React, wraps app with Google OAuth and Auth providers, disables browser scroll restoration (to prevent infinite scroll issues)

### App Setup

- **`src/app/App.jsx`**: Main app component that renders promo banner and routes
- **`src/app/AppProviders.jsx`**: Wraps the app with all context providers (AuthProvider, ToastProvider, AdminAuthProvider, ErrorBoundary)

### Routing

- **`src/routes/AppRoutes.jsx`**: Defines all routes:
  - `/` → Home page (inventory grid with search and filters)
  - `/admin` → Admin panel for adding inventory
  - `/grouping` → Developer feature to manage inventory groups
  - `/reports` → Reports page
  - `/superadmin` → SuperAdmin panel for user management
  - `/profile` → User profile page
  - `/feedback` → Feedback submission page
  - `/404` → Not found page

### Context (Global State)

Context provides shared state across components without prop drilling:

- **`AuthContext.jsx`**: Manages user login/logout state; provides `user`, `login()`, `logout()`, `signup()` methods
- **`AdminAuthContext.jsx`**: Manages admin-specific authentication state
- **`ToastContext.jsx`**: Toast notification system; provides `showToast()` method to display messages

### Services (`src/services/`)

Services handle API communication:

- **`apiClient.js`**: Axios instance configured with base URL, timeout, credentials, and interceptors for requests/responses
- **`errorHandler.js`**: Centralized error parsing and formatting
- **`interactionsService.js`**: API calls for bookmarking/saving inventories and reporting items
- **`feedbackService.js`**: API calls for submitting feedback

### Features (`src/features/`)

Features are semi-autonomous, self-contained modules. Each feature has pages, components, services, and hooks:

#### Inventory Feature (`features/inventory/`)

**Purpose**: Display, edit, and manage inventory items.

- **Pages**:
  - (Inventory has no dedicated page; appears on HomePage through InventoryGrid)

- **Components**:
  - `InventoryCard.jsx`: Displays a single inventory item with image, title, price, area, status
  - `InventoryGrid.jsx`: Infinite-scroll grid of InventoryCards
  - `InventoryCardSkeleton.jsx`: Placeholder while items load
  - `EditInventoryModal.jsx`: Modal to edit inventory details
  - `InventoryPhotoUploadModal.jsx`: Modal to upload/crop photos
  - `ImagePreview.jsx`: Display image with zoom/actions
  - `TypeFilterButton.jsx`: Filter button for inventory type
  - `InventoryTypeBadge.jsx`: Badge showing inventory status
  - `RecentSection.jsx`: Shows recently viewed items

- **Hooks**:
  - `useInventories.js`: Fetches inventory list with pagination, search, and developer filters; handles infinite scroll
  - `useBookmarks.js`: Manages saved/bookmarked inventories

- **Services**:
  - `inventoryService.js`: API endpoints for CRUD operations, search, and image uploads

#### Search Feature (`features/search/`)

**Purpose**: Search and filter inventory items.

- **Components**:
  - `SearchBar.jsx`: Input field for search with voice input support

- **Hooks**:
  - `useSearch.js`: Manages search term with debounce
  - `useSuggestions.js`: Fetches autocomplete suggestions
  - `useVoiceSearch.js`: Voice-to-text search functionality

#### Developer Feature (`features/developer/`)

**Purpose**: Tools for developers to manage and group inventories.

- **Pages**:
  - `GroupingInventoriesPage.jsx`: Interface to create/manage groups and assign inventories to groups

- **Components**:
  - `ManageGroupsModal.jsx`: Modal for creating/editing groups
  - `GroupFilterChips.jsx`: Chip buttons to filter by developer/group
  - `GroupTypeInput.jsx`: Input for group type selection

- **Hooks**:
  - `useGroups.js`: Fetches available groups (appears as "developers" in filter UI)

- **Services**:
  - `groupService.js`: API endpoints for group management

#### Admin Feature (`features/admin/`)

**Purpose**: Admin panel for inventory creation and management.

- **Pages**:
  - `AdminInventoryFormPage.jsx`: Form to add new inventory items
  - `ReportsPage.jsx`: View reports of inventory interactions and user reports

- **Components**:
  - `DeveloperBatchInventoryForm.jsx`: Bulk form for creating multiple inventory items under a developer

- **Services**:
  - `adminService.js`: API endpoints for admin operations (create inventory, get next card number)

#### SuperAdmin Feature (`features/superadmin/`)

**Purpose**: Superadmin panel for user management.

- **Pages**:
  - `SuperAdminPage.jsx`: Table to view all users, toggle admin status, block/unblock users

- **Services**:
  - `superAdminService.js`: API endpoints for user management

### Pages (`src/pages/`)

Top-level pages are layouts that usually sit inside a layout and display specific content:

- **`HomePage.jsx`**: Main page with search bar, group filters (appearing as developers), and infinite-scroll inventory grid
- **`ProfilePage.jsx`**: User profile and account settings
- **`FeedbackPage.jsx`**: Form to submit user feedback
- **`NotFoundPage.jsx`**: 404 error page

### Layouts (`src/layouts/`)

- **`MainLayout.jsx`**: Common layout wrapping all pages; typically includes header/navigation and main content area

### Common Components (`src/components/common/`)

Reusable components used across multiple features:

- **`Button.jsx`**: Styled button component
- **`Input.jsx`**: Text input component
- **`TextArea.jsx`**: Multi-line text input
- **`Select.jsx`**: Dropdown select component
- **`FileUpload.jsx`**: File input with preview
- **`EmptyState.jsx`**: Message shown when no data exists
- **`Loader.jsx`**: Loading spinner
- **`RetryState.jsx`**: Message and button for retry on error
- **`ErrorBoundary.jsx`**: Catches React errors and displays fallback UI
- **`ImageCropModal.jsx`**: Modal to crop images before upload
- **`GroupMultiSelect.jsx`**: Multi-select dropdown for groups
- **`LoginModal.jsx`**: Modal for login/signup
- **`Toast.jsx` + `ToastContainer.jsx`**: Toast notification system

### Other Components

- **`PromoBanner.jsx`**: Promotional banner displayed at app top
- **`GoogleLoginButton.jsx`**: Button to login via Google OAuth
- **`InventoryActions.jsx`**: Action buttons for inventory items

### Hooks (`src/hooks/`)

Utility hooks used globally:

- **`useDebounce.js`**: Debounce input values (delays function calls)
- **`useSiteGate.js`**: Checks if user can access certain features
- **`useInstallPrompt.js`**: PWA installation prompt
- **`useVoiceSearch.js`**: Voice recording and speech-to-text

### Styles (`src/styles/`)

- **`global.css`**: Global styles and resets
- **`variables.css`**: CSS custom properties (colors, spacing, fonts)

Component-specific styles are colocated (e.g., `Button.jsx` and `Button.css` in same folder).

### Utilities (`src/utils/`)

- **`share.js`**: Share inventory link to social media
- **`download.js`**: Download inventory details as PDF
- **`cropImage.js`**: Image cropping utility
- **`classNames.js`**: Helper to conditionally build CSS class strings

### Constants (`src/constants/`)

- **`env.js`**: Loads environment variables (API URL, etc.)
- **`appConstants.js`**: App-wide constants (toast duration, filter IDs, etc.)
- **`apiEndpoints.js`**: All API endpoint URLs organized by feature

### Configuration Files

- **`vite.config.js`**: Vite build tool configuration
- **`eslint.config.js`**: ESLint rules for code quality
- **`.env.example`**: Template for environment variables
- **`.env.development`**: Dev environment variables
- **`.env.production`**: Production environment variables
- **`vercel.json`**: Deployment configuration for Vercel

---

## Data Flow Summary

### Request Path (Frontend → Backend)

1. **Frontend Component** calls a service (e.g., `inventoryService.getAll()`)
2. **Service** uses `apiClient` (Axios) to make HTTP request
3. **Backend Route Handler** receives request and calls controller
4. **Controller** validates input and calls service
5. **Service** performs business logic and calls repository
6. **Repository** executes SQL query against database
7. **Response flows back** through Repository → Service → Controller → Route → Frontend

### User Authentication

- User logs in with Google or email/password via frontend
- Backend verifies and stores JWT token in an HTTP-only cookie
- On each request, `attachUser` middleware reads cookie, verifies JWT, and sets `req.user`
- Frontend stores user state in `AuthContext`

### Image Uploads

- User selects image on frontend
- Frontend crops image using `ImageCropModal`
- Frontend sends multipart form data to backend
- Backend receives with `multer` middleware
- File stored temporarily in memory
- Uploaded directly to Azure Blob Storage (cloud)
- Azure URL returned and stored in database
- Frontend displays image from Azure URL

---

## Key Architectural Patterns

### MVC + Service + Repository

Clear separation of concerns:
- **Controllers**: HTTP layer (request/response)
- **Services**: Business logic
- **Repositories**: Database access (queries)

### Context-Based State Management

Frontend uses React Context for:
- Authentication state (who's logged in)
- Toast notifications (success/error messages)
- Admin-specific state

### Feature-Based Organization

Frontend organizes code by feature (inventory, search, admin, etc.), making it easy to find and modify related code.

### Middleware Pipeline

Backend uses middleware to:
- Parse JSON, handle CORS
- Log requests
- Attach user from JWT
- Handle errors

### Lazy Evaluation (Database)

Developers, Sectors, and Projects are created on-demand when inventories reference them (find-or-create pattern).

---

## Environment Setup

### Backend (.env)

```
NODE_ENV=development
PORT=5000
DATABASE_SERVER=localhost
DATABASE_USER=sa
DATABASE_PASSWORD=YourPassword
DATABASE_NAME=InventoryDB
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-id
AZURE_STORAGE_ACCOUNT=your-account
AZURE_STORAGE_KEY=your-key
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-oauth-id
```

---

## Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQL Server (mssql driver)
- **Authentication**: JWT, bcryptjs, Google Auth Library
- **File Upload**: Multer, Azure Blob Storage
- **Email**: Nodemailer
- **Logging**: Morgan, custom logger
- **Security**: Helmet, CORS

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Authentication**: @react-oauth/google
- **Image Editing**: react-easy-crop
- **PDF Export**: jspdf
- **Icons**: react-icons
- **Forms**: react-hook-form
- **Styling**: CSS (no framework)

---

This structure enables scalability, maintainability, and clear separation of concerns across both backend and frontend.
