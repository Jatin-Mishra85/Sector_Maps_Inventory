# 📊 Sector Maps Inventory Management System

> A comprehensive real estate inventory management platform for developers, sectors, projects, and inventory items with modern search, grouping, and user interaction capabilities.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Future Roadmap](#future-roadmap)
- [Known Issues & Cleanup Tasks](#known-issues--cleanup-tasks)

---

## 🎯 Project Overview

### What is Sector Maps Inventory?

**Sector Maps Inventory** is a full-stack web application designed to manage real estate inventory across multiple developers, sectors, and projects. It provides a seamless experience for:

- **Developers**: Manage projects and inventory across multiple sectors
- **Clients**: Browse, search, save, and report inventory items
- **Admin Users**: Create, update, and manage the entire inventory hierarchy
- **End Users**: Discover properties through advanced search and save favorites

### The Problem It Solves

Real estate businesses struggle with:
- ❌ Scattered inventory data across multiple systems
- ❌ Difficult searching and filtering for end users
- ❌ No centralized management for developers and sectors
- ❌ Manual tracking of user-saved properties
- ❌ Lack of image management for listings

### The Solution

Sector Maps Inventory provides:
- ✅ Centralized inventory management system
- ✅ Advanced search with fuzzy matching and suggestions
- ✅ Hierarchical structure: Developer → Sector → Project → Inventory
- ✅ User save/bookmark functionality with reporting
- ✅ Cloud-based image storage (Azure Blob)
- ✅ Admin controls with role-based access
- ✅ Email notifications for reports

---

## ✨ Key Features

### 1. **Inventory Management**
- Store inventory items with card number, price, area, status, and description
- Associate images with Azure Blob Storage integration
- Organize items hierarchically under developers, sectors, and projects
- Admin-only create, update, and delete operations

| Feature | Details |
|---------|---------|
| **Card System** | Unique card numbers for inventory tracking |
| **Pricing** | Store and display property prices |
| **Area** | Square footage or plot area information |
| **Status** | Track inventory availability (Available, Sold, etc.) |
| **Images** | High-resolution image uploads via Azure Blob Storage |
| **Description** | Rich text descriptions for each property |

### 2. **Advanced Search System**
- Search across developers, sectors, projects, and group names
- Fuzzy matching for typo-tolerant search (using SOUNDEX algorithm)
- Auto-complete suggestions while typing
- Voice search support
- Keyword-based filtering

**Search Flow:**
```
User Input → Debounced Processing → Backend Search
↓
Exact Match → Fuzzy Match → Results with Metadata
```

### 3. **Inventory Grouping & Tagging**
- Tag inventory items with custom group names
- Multi-group assignment per item
- Filter inventories by group
- Bulk add/remove operations
- Perfect for organizing by locality, property type, or custom categories

### 5. **User Interactions & Reporting** *(NEW)*
- **Save/Bookmark**: Users can save favorite properties for quick access
- **Report Issues**: Submit reports for problematic or spam listings
- **Admin Dashboard**: SuperAdmins review all reports via dedicated interface
- **Email Notifications**: Admins notified immediately of new reports (Gmail SMTP)
- **Anonymous Reporting**: Report without logging in

### 6. **Image Upload & Management**
- Support for multiple image formats (JPEG, PNG, etc.)
- Client-side image cropping before upload
- Azure Blob Storage for scalable storage
- Image optimization and URL generation
- Automatic image path resolution

### 7. **Admin Controls**
- Role-based access control (Admin vs Regular Users)
- Admin-only CRUD operations for:
  - Developers, Sectors, Projects
  - Inventory items and Groups
  - Images and Inventory-Group mappings
- Dashboard for admin inventory creation and bulk operations

### 8. **SuperAdmin User Management** *(NEW)*
- Promote/demote users to admin status
- Block/unblock user accounts
- View all users and their roles
- Manage user permissions and access

### 9. **Authentication & Security**
- Google OAuth 2.0 integration
- Email/password signup and login
- JWT-based authentication with secure cookies
- Password hashing with bcryptjs
- CORS protection and security headers (Helmet)
- Two-tier admin system (Admin + SuperAdmin)

---

## 🏗️ Tech Stack & Architecture

### **Backend Stack**

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | Latest LTS |
| **Express** | Web framework | ^4.22.2 |
| **MSSQL** | Database | Microsoft SQL Server |
| **mssql** | DB driver | ^11.0.1 |
| **JWT** | Authentication | ^9.0.3 |
| **Google Auth** | OAuth 2.0 | ^10.9.1 |
| **Azure Blob Storage** | Image storage | ^12.33.0 |
| **Multer** | File uploads | ^2.2.0 |
| **Nodemailer** | Email service | ^9.0.3 |
| **Helmet** | Security headers | ^7.1.0 |
| **CORS** | Cross-origin requests | ^2.8.5 |
| **Morgan** | Request logging | ^1.10.0 |
| **Validator** | Input validation | ^7.1.0 |

### **Frontend Stack**

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI library | ^19.2.7 |
| **Vite** | Build tool | ^8.1.1 |
| **React Router** | Client-side routing | ^7.18.1 |
| **Axios** | HTTP client | ^1.18.1 |
| **React Hook Form** | Form management | ^7.81.0 |
| **React Easy Crop** | Image cropping | ^6.2.3 |
| **React Icons** | Icon library | ^5.7.0 |
| **React OAuth/Google** | Google login | ^0.13.5 |
| **ESLint** | Code linting | ^10.6.0 |

### **Infrastructure**

- **Database**: Microsoft SQL Server (MSSQL)
- **File Storage**: Azure Blob Storage
- **Email Service**: Gmail SMTP with Nodemailer
- **Authentication**: Google OAuth 2.0 + JWT

### **Architecture Diagram**

```
┌─────────────────┐
│   React App     │
│    (Vite)       │
└────────┬────────┘
         │
    Axios HTTP
         │
┌────────▼────────────────┐
│  Express Server         │
│  - Routes               │
│  - Controllers          │
│  - Middleware           │
└────────┬────────────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │          │          │          │
┌───▼──┐  ┌───▼──┐  ┌───▼──┐  ┌──▼────┐
│MSSQL │  │Azure │  │Google│  │Gmail  │
│      │  │Blob  │  │OAuth │  │SMTP   │
└──────┘  └──────┘  └──────┘  └───────┘
```

---

## 📁 Project Structure

### **Root Structure**
```
Sector_Maps_Inventory/
├── backend/               # Node.js + Express API
├── frontend/              # React + Vite application
├── PROJECT_DOCS/          # Detailed documentation
└── README.md              # This file
```

### **Backend Structure** (`backend/src/`)

```
backend/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── config/                # Configuration files
│   ├── app.config.js      # App environment settings
│   ├── db.config.js       # Database connection
│   ├── azureBlob.config.js # Azure storage setup
│   ├── logger.config.js   # Logging configuration
│   └── multer.config.js   # File upload settings
├── database/              # Database layer
│   ├── connection.js      # MSSQL connection pool
│   ├── migrations/        # Schema migrations
│   ├── procedures/        # Stored procedures
│   └── seeders/           # Sample data
├── routes/                # API routes
│   ├── auth.routes.js     # Authentication endpoints
│   ├── developer.routes.js
│   ├── sector.routes.js
│   ├── project.routes.js
│   ├── inventory.routes.js
│   ├── group.routes.js
│   ├── image.routes.js
│   ├── search.routes.js
│   ├── interactions.routes.js
│   └── index.routes.js    # Route aggregator
├── controllers/           # Request handlers (HTTP layer)
│   └── [feature].controller.js
├── services/              # Business logic layer
│   └── [feature].service.js
├── repositories/          # Data access layer (SQL queries)
│   └── [feature].repository.js
├── middleware/            # Express middleware
│   ├── auth.middleware.js # JWT verification, user attachment
│   ├── error.middleware.js
│   ├── notFound.middleware.js
│   └── requestLogger.middleware.js
├── constants/             # Application constants
│   ├── httpStatusCodes.constant.js
│   └── messages.constant.js
├── utils/                 # Helper utilities
├── validators/            # Input validation functions
├── public/uploads/        # Static file storage
└── logs/                  # Application logs

```

### **Frontend Structure** (`frontend/src/`)

```
frontend/
├── main.jsx               # React entry point
├── index.html             # HTML template
├── app/
│   └── AppProviders.jsx   # Global providers & router setup
├── routes/
│   └── AppRoutes.jsx      # Route definitions
├── pages/                 # Full-page components
│   ├── HomePage.jsx
│   ├── AdminInventoryFormPage.jsx
│   ├── GroupingInventoriesPage.jsx
│   ├── ProfilePage.jsx
│   └── NotFoundPage.jsx
├── features/              # Feature modules
│   ├── admin/             # Admin creation/management
│   ├── inventory/         # Inventory display & management
│   ├── developer/         # Developer grouping features
│   └── search/            # Search functionality
├── components/            # Reusable UI components
│   ├── LoginModal
│   ├── Button
│   ├── Toast
│   ├── EmptyState
│   └── RetryState
├── context/               # React contexts
│   ├── AuthContext.jsx    # User authentication state
│   ├── AdminAuthContext.jsx # Admin authorization state
│   └── ToastContext.jsx   # Toast notification state
├── services/              # API & utility services
│   ├── apiClient.js       # Axios instance
│   ├── errorHandler.js    # Error parsing
│   └── [feature]Service.js
├── hooks/                 # Custom React hooks
│   ├── useSearch.js
│   ├── useInventories.js
│   ├── useGroups.js
│   └── useSuggestions.js
├── constants/
│   ├── apiEndpoints.js    # API paths
│   ├── appConstants.js    # App-wide constants
│   └── env.js             # Environment configuration
├── utils/                 # Helper functions
│   ├── cropImage.js
│   ├── classNames.js
│   ├── download.js
│   └── share.js
├── styles/                # CSS/styling
├── assets/                # Images and static files
└── public/                # Public static files
    ├── manifest.json
    ├── icons/
    └── placeholders/
```

---

## 🚀 Getting Started

### **Prerequisites**

Before you begin, ensure you have:
- **Node.js** (v18 or higher) and **npm** installed
- **Microsoft SQL Server** (local or cloud instance)
- **Azure Blob Storage** account (for image uploads)
- **Google OAuth credentials** (for social login)
- A **Gmail account** with app-specific password (for notifications)

### **Step 1: Clone & Install Dependencies**

```bash
# Clone the repository
git clone <repository-url>
cd Sector_Maps_Inventory

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **Step 2: Environment Configuration**

#### **Backend Environment (.env)**

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
APP_NAME=inventory-backend

# Database Configuration
DB_HOST=<your-sql-server-host>
DB_USER=<your-db-username>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-database-name>
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT=30000

# Logging
LOG_LEVEL=debug

# JWT & Security
JWT_SECRET=<your-super-secret-jwt-key-change-in-production>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id.apps.googleusercontent.com>

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=xxxx;AccountKey=xxxx;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER=uploads

# Email Configuration (Gmail SMTP)
EMAIL_USER=<your-email@gmail.com>
EMAIL_APP_PASSWORD=<your-gmail-app-specific-password>
ADMIN_EMAIL_1=<admin1@company.com>
ADMIN_EMAIL_2=<admin2@company.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### **Frontend Environment (.env)**

Create `frontend/.env` file:

```env
# API Configuration
VITE_API_HOST=http://localhost:5000
VITE_API_PREFIX=/api/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>

# Site Configuration
VITE_APP_NAME=Sector Maps Inventory
```

### **Step 3: Database Setup**

```bash
# Navigate to backend
cd backend

# Run database connection test
npm run test:db

# Execute database migrations (if available)
npm run migrate

# Seed initial data
npm run seed
```

### **Step 4: Start the Application**

#### **Terminal 1 - Backend Server**
```bash
cd backend
npm run dev
```
✅ Backend runs on: `http://localhost:5000`

#### **Terminal 2 - Frontend Development Server**
```bash
cd frontend
npm run dev
```
✅ Frontend runs on: `http://localhost:5173`

### **Step 5: Access the Application**

- **Development Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

---

## 🔌 API Endpoints

### **Authentication**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/google` | Login via Google OAuth | ❌ |
| POST | `/auth/signup` | Create new account | ❌ |
| POST | `/auth/login` | Email/password login | ❌ |
| GET | `/auth/me` | Get current user | ❌ |
| POST | `/auth/logout` | Clear authentication | ❌ |

### **Developers** (CRUD)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/developers` | List all developers | ❌ |
| GET | `/developers/:id` | Get developer details | ❌ |
| POST | `/developers` | Create developer | 🔐 Admin |
| PUT | `/developers/:id` | Update developer | 🔐 Admin |
| DELETE | `/developers/:id` | Delete developer | 🔐 Admin |

### **Sectors** (CRUD)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/sectors` | List all sectors | ❌ |
| GET | `/sectors/:id` | Get sector details | ❌ |
| POST | `/sectors` | Create sector | 🔐 Admin |
| PUT | `/sectors/:id` | Update sector | 🔐 Admin |
| DELETE | `/sectors/:id` | Delete sector | 🔐 Admin |

### **Projects** (CRUD)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/projects` | List all projects | ❌ |
| GET | `/projects/:id` | Get project details | ❌ |
| POST | `/projects` | Create project | 🔐 Admin |
| PUT | `/projects/:id` | Update project | 🔐 Admin |
| DELETE | `/projects/:id` | Delete project | 🔐 Admin |

### **Inventory**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/inventories` | List with pagination | ❌ |
| GET | `/inventories/:id` | Get inventory details | ❌ |
| GET | `/inventories/next-card-number` | Next available card # | ❌ |
| POST | `/inventories` | Create (multipart form) | 🔐 Admin |
| PUT | `/inventories/:id` | Update inventory | 🔐 Admin |
| DELETE | `/inventories/:id` | Delete inventory | 🔐 Admin |

### **Groups**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/groups` | List with counts | ❌ |
| GET | `/groups/:id` | Get group details | ❌ |
| POST | `/groups` | Create group | 🔐 Admin |
| PUT | `/groups/:id` | Update group | 🔐 Admin |
| DELETE | `/groups/:id` | Delete group | 🔐 Admin |
| POST | `/groups/add-inventories` | Add items to group | 🔐 Admin |
| POST | `/groups/remove-inventories` | Remove items from group | 🔐 Admin |

### **Search**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search/inventories` | Search by keyword | ❌ |
| GET | `/search/suggest` | Get suggestions | ❌ |

### **Interactions** *(Updated)*

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/interactions/save` | Save inventory | 🔐 Auth |
| DELETE | `/interactions/unsave/:inventoryId` | Remove saved | 🔐 Auth |
| GET | `/interactions/saved` | Get saved items | 🔐 Auth |
| POST | `/interactions/report` | Report inventory | ❌ |
| GET | `/interactions/reports` | View all reports | 🔐 SuperAdmin |

### **Admin User Management** *(NEW)*

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users` | List all users | 🔐 SuperAdmin |
| PATCH | `/admin/users/:userId/toggle-admin` | Promote/demote admin | 🔐 SuperAdmin |
| PATCH | `/admin/users/:userId/toggle-block` | Block/unblock user | 🔐 SuperAdmin |

---

## 🔐 Authentication & Authorization

### **Auth Flow**

```
Login → JWT Token → Cookie (auth_token) → Verified on Each Request
```

### **Authentication Methods**

1. **Google OAuth 2.0**
   - Sends `idToken` to backend
   - Backend verifies with Google
   - Creates JWT and sets cookie

2. **Email/Password**
   - Password hashed with bcryptjs
   - JWT issued on login success

### **Authorization Levels** *(Updated)*

| Role | Capabilities |
|------|--------------|
| **Public** | Browse inventory, search, report issues, submit reports |
| **Authenticated User** | Save/bookmark items, view saved list, report items |
| **Admin** | Full CRUD on inventory, manage groups, view reports |
| **SuperAdmin** | All Admin privileges + manage users, promote admins, block accounts |

### **Protected Endpoints**

- Admin-only: All POST/PUT/DELETE on developers, sectors, projects, inventory, groups, images
- Auth-required: Save, unsave, view saved inventory
- Public: Search, suggestions, list browsing

---

## 🛠️ Development Commands

### **Backend**
```bash
cd backend

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (if configured)
npm test

# Lint code
npm run lint
```

### **Frontend**
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Check unused imports/exports
npm run knip
```

---

## 📊 Database Schema Overview

The database uses Microsoft SQL Server with the following key tables:

| Table | Purpose |
|-------|---------|
| `Users` | User accounts & authentication with role flags (IsAdmin, IsSuperAdmin) |
| `Developers` | Real estate developers |
| `Sectors` | Geographic/property sectors |
| `Projects` | Development projects |
| `Inventories` | Individual property listings |
| `Images` | Image metadata & paths |
| `Groups` | Custom user groups for inventory organization |
| `InventoryGroups` | Inventory-group mappings (many-to-many) |
| `SavedInventory` *(NEW)* | User's saved/bookmarked items |
| `Reports` *(NEW)* | Reported problematic listings with reason & details |

> For detailed schema with columns and relationships, see [DATABASE_SCHEMA.md](PROJECT_DOCS/08_DATABASE_SCHEMA.md)

---

## 🎯 Future Roadmap

### **Phase 2 - Enhanced Features**
- [ ] Advanced filtering by price range, area, and status
- [ ] Map view for inventory visualization
- [ ] Email notifications for inventory updates
- [ ] Batch operations for inventory management
- [ ] Advanced analytics dashboard for admins

### **Phase 3 - User Experience**
- [ ] Mobile-responsive improvements
- [ ] Dark mode support
- [ ] Wishlist collections
- [ ] Property comparison tool
- [ ] Download property brochures

### **Phase 4 - Community & Social**
- [ ] User reviews and ratings
- [ ] Property comments and discussions
- [ ] Refer a friend functionality
- [ ] Social media sharing enhancements
- [ ] Community forums

### **Phase 5 - Business Intelligence**
- [ ] Admin analytics dashboard
- [ ] Inventory performance metrics
- [ ] User behavior analytics
- [ ] Export reports (PDF, Excel)
- [ ] Real-time monitoring

### **Phase 6 - Integration & Expansion**
- [ ] WhatsApp integration for inquiries
- [ ] CRM integration
- [ ] Third-party mapping services
- [ ] Multiple language support (i18n)
- [ ] Multi-currency support

---

## ⚠️ Known Issues & Cleanup Tasks

### **Confirmed Bugs**

1. **Duplicate Function in Interactions Service**
   - File: `backend/src/services/interactions.service.js`
   - Issue: `reportInventory` function defined twice
   - Impact: Can break report submission
   - Status: ⏳ Needs fixing

2. **Bypass in InventoryGrid**
   - File: `frontend/src/features/inventory/components/InventoryGrid/InventoryGrid.jsx`
   - Issue: Uses direct `fetch()` instead of centralized `apiClient`
   - Impact: Inconsistent error handling
   - Status: ⏳ Needs refactoring

3. **Debug Logs in Group Repository**
   - File: `backend/src/repositories/group.repository.js`
   - Issue: Console logs in `findOrCreateByName`
   - Impact: Production logging overhead
   - Status: ⏳ Needs cleanup

### **Technical Debt**

- [ ] Search suggestions dropdown disabled in UI despite backend support
- [ ] Temporary site gate (`useSiteGate.js`) should be removed
- [ ] Admin validation flows need consolidation
- [ ] Image upload only through inventory routes (direct image API exists but unused)
- [ ] Inventory type filter branch exists but frontend doesn't use it

### **Suggested Cleanup Tasks**

| Priority | Task | Effort |
|----------|------|--------|
| 🔴 High | Fix duplicate `reportInventory` function | 30 min |
| 🔴 High | Remove debug logs from repositories | 15 min |
| 🟠 Medium | Refactor InventoryGrid to use `apiClient` | 1 hour |
| 🟠 Medium | Enable search suggestions UI | 45 min |
| 🟡 Low | Remove temporary site gate | 20 min |
| 🟡 Low | Consolidate admin validation logic | 1.5 hours |

---

## 📚 Additional Documentation

Detailed documentation is available in the `PROJECT_DOCS/` folder:

- [01_OVERVIEW.md](PROJECT_DOCS/01_OVERVIEW.md) - Project overview and tech stack
- [02_FRONTEND_STRUCTURE.md](PROJECT_DOCS/02_FRONTEND_STRUCTURE.md) - Frontend architecture details
- [03_BACKEND_STRUCTURE.md](PROJECT_DOCS/03_BACKEND_STRUCTURE.md) - Backend architecture details
- [04_API_ENDPOINTS.md](PROJECT_DOCS/04_API_ENDPOINTS.md) - Complete API reference (updated with new endpoints)
- [05_KEY_FEATURES.md](PROJECT_DOCS/05_KEY_FEATURES.md) - Feature implementations
- [06_KNOWN_ISSUES_AND_CLEANUP.md](PROJECT_DOCS/06_KNOWN_ISSUES_AND_CLEANUP.md) - Bugs and tech debt
- [07_CHANGE_LOG.md](PROJECT_DOCS/07_CHANGE_LOG.md) - Version history
- [08_DATABASE_SCHEMA.md](PROJECT_DOCS/08_DATABASE_SCHEMA.md) - Database structure
- [09_AUTHORIZATION.md](PROJECT_DOCS/09_AUTHORIZATION.md) - Auth/security details (updated with SuperAdmin)
- [10_DEPLOYMENT.md](PROJECT_DOCS/10_DEPLOYMENT.md) - Deployment guide
- **[11_USER_INTERACTIONS_AND_REPORTS.md](PROJECT_DOCS/11_USER_INTERACTIONS_AND_REPORTS.md)** *(NEW)* - Save/Report/Email system
- **[12_ADMIN_AND_SUPERADMIN_MANAGEMENT.md](PROJECT_DOCS/12_ADMIN_AND_SUPERADMIN_MANAGEMENT.md)** *(NEW)* - User management features
- **[13_EMAIL_NOTIFICATIONS.md](PROJECT_DOCS/13_EMAIL_NOTIFICATIONS.md)** *(NEW)* - Email service configuration

---

## 🤝 Contributing

To contribute to this project:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

Please follow the existing code structure and naming conventions.

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Create an issue in the project repository
- Contact the development team
- Review existing documentation in `PROJECT_DOCS/`

---

## 🎉 Quick Summary

**Sector Maps Inventory** is a modern, full-stack real estate management platform with:

✅ **50+** API endpoints  
✅ **6** major features (inventory, search, groups, interactions, auth, images)  
✅ **Role-based** access control  
✅ **Cloud-ready** with Azure Blob Storage  
✅ **Modern tech stack** (React, Node.js, MSSQL)  
✅ **Professional documentation** for developers and users  

---

**Last Updated**: August 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
