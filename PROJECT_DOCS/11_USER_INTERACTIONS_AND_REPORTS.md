# User Interactions & Report System

## Overview

The User Interactions feature enables users to:
- **Save/Bookmark** inventory items for later viewing
- **Report Issues** with inventory listings
- **Track Saved Items** across sessions

Reports are monitored by SuperAdmins through a dedicated dashboard and generate email notifications.

---

## 1. Frontend Implementation

### Components & Pages

#### `InventoryActions`
- Render save/unsave buttons in `InventoryCard`
- Display save status with visual indicator
- Handle report submission modal
- Async state management with loading indicators

#### `ReportsPage` *(NEW)*
- SuperAdmin-only dashboard
- Display all user reports with metadata:
  - User who submitted report
  - Inventory item being reported
  - Reason and details
  - Timestamp of report
  - Report status
- Filtering and sorting capabilities

### Context

#### `AuthContext`
- Stores logged-in user's ID and email
- Used by `interactionsService` to track user interactions

### Services

#### `interactionsService.js` *(NEW)*
```javascript
saveInventory(inventoryId)           // POST /api/v1/interactions/save
unsaveInventory(inventoryId)         // DELETE /api/v1/interactions/unsave/:id
getSavedInventories()                // GET /api/v1/interactions/saved
reportInventory(inventoryId, reason, details)  // POST /api/v1/interactions/report
```

### Data Flow

```
Save Button Click
    ↓
saveInventory(id) API call
    ↓
Backend stores in SavedInventory table
    ↓
UI updates with save indicator
    ↓
GET /saved refreshes saved list
```

---

## 2. Backend Implementation

### Routes (`interactions.routes.js`) *(NEW)*

| Method | Path | Auth | Handler | Purpose |
|--------|------|------|---------|---------|
| POST | `/interactions/save` | Auth | `saveInventory` | Save item for user |
| DELETE | `/interactions/unsave/:inventoryId` | Auth | `unsaveInventory` | Remove from saved |
| GET | `/interactions/saved` | Auth | `getSavedInventories` | List user's saved IDs |
| POST | `/interactions/report` | Public | `reportInventory` | Submit issue report |
| GET | `/interactions/reports` | SuperAdmin | `getAllReports` | Admin dashboard |

### Controllers (`interactions.controller.js`) *(NEW)*

```javascript
saveInventory(req, res)
  - Validates inventoryId exists
  - Calls service to save
  - Returns success or duplicate error

unsaveInventory(req, res)
  - Validates inventoryId
  - Calls service to remove
  - Returns success status

reportInventory(req, res)
  - Validates report data
  - Stores report with optional userId
  - Triggers async email notification
  - Returns success (does not wait for email)

getSavedInventories(req, res)
  - Gets user from auth context
  - Returns array of saved inventory IDs

getAllReports(req, res)
  - Returns all reports with joins to Users and Inventories
```

### Services (`interactions.service.js`) *(NEW)*

```javascript
saveInventory(userId, inventoryId)
  - Validates inventory exists
  - Calls repository to save
  - Handles duplicate constraint gracefully

unsaveInventory(userId, inventoryId)
  - Calls repository to delete saved entry
  - Throws error if not found

reportInventory(userId, inventoryId, reason, details)
  - Validates inventoryId exists
  - Validates reason is in: ["Wrong info", "Spam", "Duplicate", "Other"]
  - Validates details length: 1-500 characters
  - Calls repository to store report
  - Calls email service asynchronously (fire-and-forget)
  - Returns report confirmation

getSavedInventories(userId)
  - Returns array of saved inventory IDs for user
```

### Repositories (`interactions.repository.js`) *(NEW)*

```javascript
saveInventory(userId, inventoryId)
  // INSERT INTO SavedInventory (UserId, InventoryId, SavedAt)
  // ON DUPLICATE KEY UPDATE SavedAt = NOW()

unsaveInventory(userId, inventoryId)
  // DELETE FROM SavedInventory WHERE UserId = @userId AND InventoryId = @inventoryId

getSavedInventoryIds(userId)
  // SELECT InventoryId FROM SavedInventory WHERE UserId = @userId

reportInventory(userId, inventoryId, reason, details)
  // INSERT INTO Reports (UserId, InventoryId, Reason, Details, ReportedAt)

getAllReports()
  // SELECT r.*, u.Email, u.Name, i.CardNumber
  // FROM Reports r
  // LEFT JOIN Users u ON r.UserId = u.UserId
  // LEFT JOIN Inventories i ON r.InventoryId = i.InventoryId
  // ORDER BY r.ReportedAt DESC
```

### Email Service (`email.service.js`) *(NEW)*

```javascript
sendReportNotification(report, inventory, user)
  - Called asynchronously after report submission
  - Sends email to ADMIN_EMAIL_1 and ADMIN_EMAIL_2
  - Email contains:
    - Reported inventory card number
    - Report reason
    - Report details
    - Reported by (user email or "Anonymous")
    - Timestamp
  - Graceful failure: logs error but does not crash

Configuration:
  - Gmail SMTP via nodemailer
  - Uses EMAIL_USER (sender account) and EMAIL_APP_PASSWORD
  - Requires app-specific password for Gmail 2FA accounts
```

---

## 3. Database Schema *(NEW TABLES)*

### SavedInventory Table

```sql
CREATE TABLE SavedInventory (
    SavedId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    InventoryId INT NOT NULL,
    SavedAt DATETIME DEFAULT GETDATE(),
    UNIQUE(UserId, InventoryId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    FOREIGN KEY (InventoryId) REFERENCES Inventories(InventoryId) ON DELETE CASCADE
);

CREATE INDEX idx_SavedInventory_UserId ON SavedInventory(UserId);
CREATE INDEX idx_SavedInventory_InventoryId ON SavedInventory(InventoryId);
```

### Reports Table

```sql
CREATE TABLE Reports (
    ReportId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NULL,  -- NULL if anonymous
    InventoryId INT NOT NULL,
    Reason NVARCHAR(50) NOT NULL,  -- "Wrong info", "Spam", "Duplicate", "Other"
    Details NVARCHAR(500) NOT NULL,
    ReportedAt DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'NEW',  -- NEW, REVIEWED, RESOLVED, DISMISSED
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL,
    FOREIGN KEY (InventoryId) REFERENCES Inventories(InventoryId) ON DELETE CASCADE
);

CREATE INDEX idx_Reports_UserId ON Reports(UserId);
CREATE INDEX idx_Reports_InventoryId ON Reports(InventoryId);
CREATE INDEX idx_Reports_ReportedAt ON Reports(ReportedAt DESC);
CREATE INDEX idx_Reports_Status ON Reports(Status);
```

---

## 4. API Response Examples

### Save Inventory

**Request:**
```bash
POST /api/v1/interactions/save
Content-Type: application/json

{ "inventoryId": 42 }
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "Inventory saved successfully",
  "data": {
    "savedId": 123,
    "userId": 5,
    "inventoryId": 42,
    "savedAt": "2024-08-13T10:30:00Z"
  }
}
```

### Report Inventory

**Request:**
```bash
POST /api/v1/interactions/report
Content-Type: application/json

{
  "inventoryId": 42,
  "reason": "Spam",
  "details": "This property listing is fake and has been reported multiple times"
}
```

**Success Response (201):**
```json
{
  "status": 201,
  "message": "Report submitted successfully. Our team will review it shortly.",
  "data": {
    "reportId": 789,
    "inventoryId": 42,
    "reason": "Spam",
    "reportedAt": "2024-08-13T10:35:00Z"
  }
}
```

### Get Saved Inventories

**Request:**
```bash
GET /api/v1/interactions/saved
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "Saved inventories retrieved",
  "data": [42, 87, 156, 203]
}
```

### Get All Reports (SuperAdmin)

**Request:**
```bash
GET /api/v1/interactions/reports
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "Reports retrieved",
  "data": [
    {
      "reportId": 789,
      "inventoryId": 42,
      "cardNumber": "A-001-2024",
      "reason": "Spam",
      "details": "This property listing is fake...",
      "reportedBy": "user@example.com",
      "reportedAt": "2024-08-13T10:35:00Z",
      "status": "NEW"
    },
    {
      "reportId": 790,
      "inventoryId": 87,
      "cardNumber": "A-002-2024",
      "reason": "Wrong info",
      "details": "Price is incorrect...",
      "reportedBy": "Anonymous",
      "reportedAt": "2024-08-13T11:00:00Z",
      "status": "NEW"
    }
  ]
}
```

---

## 5. Error Handling

### Client-side (Frontend)

- Show loading state while saving/reporting
- Display success toast notification
- Show error message if save/report fails
- Gracefully handle network errors
- Warn user if unsave fails due to network issue

### Server-side (Backend)

- **Validation Errors (400)**: Invalid input
- **Duplicate Save (409)**: Item already saved
- **Not Found (404)**: Inventory doesn't exist
- **Auth Errors (401/403)**: User not authenticated
- **Email Failures**: Log error but return success (fire-and-forget pattern)

---

## 6. Email Notification Flow

```
User submits report
    ↓
reportInventory() endpoint processes
    ↓
Report stored in database
    ↓
Async email service triggered (fire-and-forget)
    ↓
email.service.sendReportNotification()
    ↓
SMTP connection to Gmail
    ↓
Email sent to ADMIN_EMAIL_1, ADMIN_EMAIL_2
    ↓
API returns success immediately (does not wait for email)
```

**Email Template:**
```
Subject: New Property Report Submitted

Dear Admin,

A new report has been submitted regarding a property listing:

Property Card Number: {cardNumber}
Report Reason: {reason}
Report Details: {details}

Reported By: {userEmail or "Anonymous"}
Reported At: {timestamp}

Please log in to the admin panel to review and take action.

Best regards,
Sector Maps Inventory System
```

---

## 7. Testing Scenarios

### Manual Testing Checklist

- [ ] User can save inventory item
- [ ] Saved status indicator appears on card
- [ ] User can unsave item
- [ ] User can report inventory
- [ ] Report reason validation works (only allows specific reasons)
- [ ] Report details validation works (1-500 chars)
- [ ] Anonymous report submission works (no auth required)
- [ ] SuperAdmin can view all reports
- [ ] Report email sent to admin
- [ ] Duplicate save is gracefully handled
- [ ] Unsave of non-saved item returns proper error

---

## 8. Configuration Requirements

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
ADMIN_EMAIL_1=admin1@company.com
ADMIN_EMAIL_2=admin2@company.com
```

### Frontend .env

```env
# Already defined in common config
VITE_API_HOST=http://localhost:5000
VITE_API_PREFIX=/api/v1
```

---

## 9. Known Issues & Future Improvements

### Known Issues
- Email service uses fire-and-forget pattern (no retry on failure)
- Report status tracking is not yet integrated with admin actions
- No rate limiting on report submissions

### Future Improvements
- [ ] Add email retry logic with exponential backoff
- [ ] Create report resolution workflow (REVIEWED → RESOLVED)
- [ ] Add rate limiting to prevent spam reports
- [ ] Create bulk actions for reports (mark as reviewed, dismiss multiple)
- [ ] Add admin notes field to reports
- [ ] Create analytics dashboard for report trends
- [ ] Implement automated actions based on report patterns
- [ ] Add notification preferences for users

---

**Last Updated**: August 2024  
**Status**: ✅ Fully Implemented
