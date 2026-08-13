# Admin & SuperAdmin User Management

## Overview

The Admin & SuperAdmin system provides role-based access control and user management capabilities:

- **Admin**: Can create/modify inventory, manage groups, view reports
- **SuperAdmin**: Can manage users (promote admins, block accounts), view all reports

This document covers the SuperAdmin user management features.

---

## 1. Role Hierarchy

```
┌─────────────────────────────────────────┐
│         SuperAdmin (System)              │
│  - Manage all users                      │
│  - Promote/demote admins                 │
│  - Block/unblock accounts                │
│  - View all reports                      │
│  - All Admin privileges                  │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│         Admin (Content Mgmt)             │
│  - Create/edit inventory                 │
│  - Manage groups                         │
│  - View reports                          │
│  - Standard user privileges              │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      Standard User (Browsing)            │
│  - Browse inventory                      │
│  - Search                                │
│  - Save/bookmark items                   │
│  - Submit reports                        │
└─────────────────────────────────────────┘
```

---

## 2. Frontend Implementation

### SuperAdminPage *(NEW)*

**Location:** `frontend/src/features/superadmin/pages/SuperAdminPage.jsx`

**Features:**
- List all users in the system with:
  - User ID, Email, Name
  - Account creation date
  - Admin status
  - Block status
  - Action buttons (promote, demote, block, unblock)

**Layout:**
```
┌─────────────────────────────────────────┐
│    SuperAdmin Dashboard - User Manager   │
├─────────────────────────────────────────┤
│ Filter: ☐ Admins  ☐ Blocked  ☐ Active  │
├─────────────────────────────────────────┤
│ Email              Created      Actions  │
│────────────────────────────────────────  │
│ admin1@co.com   2024-01-15   [⚙ ⊘ ☑]  │
│ user2@co.com    2024-02-20   [⚙ ⊘ ☑]  │
│ blocked@co.com  2024-03-10   [⚙ ✓ ☒]  │
│ ...                                      │
└─────────────────────────────────────────┘

⚙ = Toggle Admin
⊘ = Block User
☑ = Unblock User
✓ = Already Admin
☒ = Blocked
```

### SuperAdmin Service *(NEW)*

**Location:** `frontend/src/features/superadmin/services/superAdminService.js`

```javascript
getAllUsers()                           // GET /api/v1/admin/users
toggleUserAdmin(userId)                 // PATCH /api/v1/admin/users/:userId/toggle-admin
toggleUserBlock(userId)                 // PATCH /api/v1/admin/users/:userId/toggle-block
```

### Frontend Context Integration

```javascript
// In AppProviders.jsx
import AdminAuthContext from './context/AdminAuthContext';

<AdminAuthContext.Provider value={adminContextValue}>
  {/* App routes */}
</AdminAuthContext.Provider>

// In component
const { isSuperAdmin } = useContext(AdminAuthContext);

if (!isSuperAdmin) {
  return <UnauthorizedPage />;
}
```

### User Feedback

- Loading spinners during API calls
- Toast notifications on success/error
- Confirmation dialogs before promoting/demoting admin
- Confirmation dialogs before blocking/unblocking

---

## 3. Backend Implementation

### Routes (`admin.routes.js`) *(NEW)*

```javascript
// admin.routes.js
router.get('/users', requireSuperAdmin, adminController.getAllUsers);
router.patch('/users/:userId/toggle-admin', requireSuperAdmin, adminController.toggleUserAdmin);
router.patch('/users/:userId/toggle-block', requireSuperAdmin, adminController.toggleUserBlock);
```

### Controllers (`admin.controller.js`) *(NEW)*

```javascript
// admin.controller.js

getAllUsers(req, res)
  - Calls service to fetch all users
  - Returns list with userId, email, name, picture, createdAt, isAdmin, isSuperAdmin, isBlocked
  - Ordered by createdAt DESC (newest first)

toggleUserAdmin(req, res)
  - Validates userId exists
  - Checks SuperAdmin cannot be demoted
  - Calls service to toggle IsAdmin flag
  - Returns updated user object
  - Sends error if trying to modify own SuperAdmin status

toggleUserBlock(req, res)
  - Validates userId exists
  - Checks SuperAdmin cannot be blocked
  - Calls service to toggle IsBlocked flag
  - Returns updated user object
  - Sends error if trying to block own account
```

### Services (`admin.service.js`) *(NEW)*

```javascript
// admin.service.js

getAllUsers()
  - Calls repository to fetch all users
  - Returns formatted user data without password hashes
  - Sorted by creation date

toggleUserAdmin(userId, currentUserId)
  - Validates userId is not SuperAdmin
  - Validates userId is not the current user
  - Calls repository to toggle IsAdmin flag
  - Returns updated user

toggleUserBlock(userId, currentUserId)
  - Validates userId is not SuperAdmin
  - Validates userId is not the current user
  - Calls repository to toggle IsBlocked flag
  - If blocking: terminates active sessions (logout)
  - Returns updated user
```

### Repositories (`admin.repository.js`) *(NEW)*

```javascript
// admin.repository.js

getAllUsers()
  // SELECT UserId, Email, Name, Picture, CreatedAt, IsAdmin, IsSuperAdmin, IsBlocked
  // FROM Users
  // ORDER BY CreatedAt DESC

toggleUserAdmin(userId)
  // UPDATE Users
  // SET IsAdmin = CASE WHEN IsAdmin = 1 THEN 0 ELSE 1 END
  // WHERE UserId = @userId

toggleUserBlock(userId)
  // UPDATE Users
  // SET IsBlocked = CASE WHEN IsBlocked = 1 THEN 0 ELSE 1 END
  // WHERE UserId = @userId
```

### Middleware (`auth.middleware.js`) *(UPDATED)*

**New Middleware:** `requireSuperAdmin`

```javascript
requireSuperAdmin(req, res, next)
  - Checks if req.user exists
  - Checks if req.user.IsSuperAdmin === 1
  - Throws 403 Forbidden if not SuperAdmin
  - Calls next() if authorized
```

### User Model Validation

**Constraints:**
- SuperAdmin IsSuperAdmin flag cannot be changed (system integrity)
- SuperAdmin cannot be blocked (system integrity)
- SuperAdmin cannot be demoted from admin (IsSuperAdmin ⊂ IsAdmin)
- Current user cannot modify their own admin status
- Current user cannot block themselves

---

## 4. Database Schema (Users Table Updates)

```sql
-- Users table columns relevant to admin/superadmin
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(255),
    Picture NVARCHAR(MAX),
    PasswordHash NVARCHAR(255) NULL,  -- NULL for OAuth users
    IsAdmin BIT DEFAULT 0,            -- Can manage inventory
    IsSuperAdmin BIT DEFAULT 0,       -- Can manage users
    IsBlocked BIT DEFAULT 0,          -- Account locked
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Add these constraints
ALTER TABLE Users ADD CONSTRAINT chk_admin_hierarchy 
  CHECK (IsSuperAdmin = 0 OR IsAdmin = 1);  -- SuperAdmin must also be Admin

ALTER TABLE Users ADD CONSTRAINT chk_superadmin_not_blocked
  CHECK (IsSuperAdmin = 0 OR IsBlocked = 0);  -- SuperAdmin cannot be blocked
```

---

## 5. API Endpoints

### Get All Users

**Request:**
```bash
GET /api/v1/admin/users
Authorization: Bearer <superadmin-token>
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "userId": 1,
      "email": "superadmin@company.com",
      "name": "System Admin",
      "picture": "https://...",
      "createdAt": "2024-01-01T00:00:00Z",
      "isAdmin": true,
      "isSuperAdmin": true,
      "isBlocked": false
    },
    {
      "userId": 2,
      "email": "admin@company.com",
      "name": "Content Admin",
      "picture": "https://...",
      "createdAt": "2024-01-10T00:00:00Z",
      "isAdmin": true,
      "isSuperAdmin": false,
      "isBlocked": false
    },
    {
      "userId": 3,
      "email": "user@example.com",
      "name": "Regular User",
      "picture": "https://...",
      "createdAt": "2024-01-20T00:00:00Z",
      "isAdmin": false,
      "isSuperAdmin": false,
      "isBlocked": false
    }
  ]
}
```

### Toggle User Admin Status

**Request:**
```bash
PATCH /api/v1/admin/users/3/toggle-admin
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{}
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "User admin status updated",
  "data": {
    "userId": 3,
    "email": "user@example.com",
    "name": "Regular User",
    "isAdmin": true,  // Changed from false
    "isSuperAdmin": false,
    "isBlocked": false
  }
}
```

**Error Response (403 - Cannot demote SuperAdmin):**
```json
{
  "status": 403,
  "message": "Cannot modify SuperAdmin user"
}
```

### Toggle User Block Status

**Request:**
```bash
PATCH /api/v1/admin/users/3/toggle-block
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{}
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "User block status updated",
  "data": {
    "userId": 3,
    "email": "user@example.com",
    "isBlocked": true,  // Changed from false
    "isAdmin": false,
    "isSuperAdmin": false
  }
}
```

**Error Response (403 - Cannot block self):**
```json
{
  "status": 403,
  "message": "You cannot block your own account"
}
```

---

## 6. Frontend Components

### UserList Component

**Props:**
```javascript
{
  users: User[],
  loading: boolean,
  onToggleAdmin: (userId) => Promise,
  onToggleBlock: (userId) => Promise
}
```

**States:**
- Idle (showing list)
- Loading (fetching or updating)
- Error (with error message)

**Actions:**
```
Click promote/demote admin button
  → Show confirmation dialog
  → Call onToggleAdmin(userId)
  → Show loading spinner
  → Update UI on success
  → Show error toast on failure

Click block/unblock button
  → Show confirmation dialog with warning
  → Call onToggleBlock(userId)
  → Show loading spinner
  → Update UI on success
  → Show error toast on failure
```

### Confirmation Dialogs

**Promote to Admin:**
```
┌─────────────────────────────────────┐
│  Promote User to Admin?              │
├─────────────────────────────────────┤
│ This user will be able to create    │
│ and manage inventory items.         │
│                                      │
│ Email: user@example.com             │
│                                      │
│         [ Cancel ]  [ Confirm ]     │
└─────────────────────────────────────┘
```

**Block User:**
```
┌─────────────────────────────────────┐
│  Block User Account?                │
├─────────────────────────────────────┤
│ ⚠ WARNING: This user will lose all  │
│ access to the system. Their active  │
│ sessions will be terminated.        │
│                                      │
│ Email: user@example.com             │
│                                      │
│  [ Cancel ]  [ Block User ]        │
└─────────────────────────────────────┘
```

---

## 7. Error Handling

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | User updated successfully |
| 400 | Bad Request | Invalid userId format |
| 401 | Unauthorized | Token missing/invalid |
| 403 | Forbidden | Not SuperAdmin; Cannot modify SuperAdmin |
| 404 | Not Found | User ID doesn't exist |
| 500 | Server Error | Database connection failed |

### Error Response Format

```json
{
  "status": 403,
  "message": "You do not have permission to perform this action",
  "error": "INSUFFICIENT_PERMISSIONS",
  "details": {
    "required": "SuperAdmin",
    "current": "Admin"
  }
}
```

---

## 8. Security Considerations

### Access Control
- ✅ All endpoints protected by `requireSuperAdmin` middleware
- ✅ Checks `IsSuperAdmin` flag in database, not just frontend
- ✅ SuperAdmin status cannot be changed via admin endpoints
- ✅ SuperAdmin cannot be blocked

### Data Protection
- ✅ Password hashes never returned in API responses
- ✅ Email notifications sent when account is blocked
- ✅ Audit logging recommended for user management actions
- ✅ Active sessions terminated when user is blocked

### Validation
- ✅ User existence validated before modification
- ✅ Input validation on userId (must be integer)
- ✅ Prevent self-modification (cannot change own status)
- ✅ Prevent SuperAdmin modification (system integrity)

---

## 9. Testing Scenarios

### Manual Testing Checklist

- [ ] SuperAdmin can view all users
- [ ] SuperAdmin can promote user to admin
- [ ] SuperAdmin can demote admin to user
- [ ] SuperAdmin cannot demote themselves
- [ ] SuperAdmin cannot modify SuperAdmin user
- [ ] SuperAdmin can block user account
- [ ] SuperAdmin can unblock user account
- [ ] SuperAdmin cannot block themselves
- [ ] Regular users cannot access admin endpoints
- [ ] Admins cannot access admin endpoints (only SuperAdmin)
- [ ] Blocked user cannot login
- [ ] Blocked user's active sessions are terminated

### Unit Tests

```javascript
describe('Admin User Management', () => {
  test('SuperAdmin can promote user to admin', async () => {
    const response = await toggleUserAdmin(userId);
    expect(response.isAdmin).toBe(true);
  });

  test('Cannot modify SuperAdmin user', async () => {
    const response = await toggleUserAdmin(superAdminId);
    expect(response.status).toBe(403);
  });

  test('User cannot access admin endpoints', async () => {
    const response = await getAllUsers(userToken);
    expect(response.status).toBe(403);
  });
});
```

---

## 10. Configuration

### Environment Variables

No additional environment variables required. Uses existing auth configuration.

### Frontend Routes

Add to `AppRoutes.jsx`:
```javascript
{
  path: '/superadmin',
  element: <ProtectedRoute requiredRole="superadmin"><SuperAdminPage /></ProtectedRoute>,
  errorElement: <ErrorPage />
}
```

---

## 11. Audit Logging (Recommended Future Feature)

**Suggested Implementation:**

```sql
CREATE TABLE AdminAuditLog (
    AuditId INT PRIMARY KEY IDENTITY(1,1),
    AdminId INT NOT NULL,
    Action NVARCHAR(50),
    TargetUserId INT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    Timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AdminId) REFERENCES Users(UserId),
    FOREIGN KEY (TargetUserId) REFERENCES Users(UserId)
);
```

Log all admin actions:
- Promoted user to admin
- Demoted user from admin
- Blocked user
- Unblocked user
- Admin login/logout

---

## 12. Known Limitations & Future Improvements

### Current Limitations
- No audit logging of admin actions
- No bulk operations (promote multiple users at once)
- No scheduled/automated role changes
- No role expiration (temporary admin)
- SuperAdmin cannot be changed (requires database admin)

### Future Improvements
- [ ] Implement audit logging
- [ ] Add bulk user management (CSV import/export)
- [ ] Implement temporary admin roles with expiration
- [ ] Add two-factor authentication for SuperAdmin
- [ ] Create admin activity dashboard
- [ ] Implement role-based permissions (granular control)
- [ ] Add user invitation system
- [ ] Create backup admin recovery procedures

---

**Last Updated**: August 2024  
**Status**: ✅ Fully Implemented
