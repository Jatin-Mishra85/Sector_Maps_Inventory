# API ENDPOINTS

Method | Path | Purpose | Auth required
---|---|---|---
POST | `/api/v1/auth/google` | Google login with `idToken`; sets `auth_token` cookie | No
POST | `/api/v1/auth/signup` | Email/password signup; sets `auth_token` cookie | No
POST | `/api/v1/auth/login` | Email/password login; sets `auth_token` cookie | No
GET | `/api/v1/auth/me` | Returns current user or null | No
POST | `/api/v1/auth/logout` | Clears auth cookie | No
GET | `/api/v1/developers` | List developers | No
GET | `/api/v1/developers/:id` | Get developer by ID | No
POST | `/api/v1/developers` | Create developer | Admin
PUT | `/api/v1/developers/:id` | Update developer | Admin
DELETE | `/api/v1/developers/:id` | Delete developer | Admin
GET | `/api/v1/sectors` | List sectors | No
GET | `/api/v1/sectors/:id` | Get sector by ID | No
POST | `/api/v1/sectors` | Create sector | Admin
PUT | `/api/v1/sectors/:id` | Update sector | Admin
DELETE | `/api/v1/sectors/:id` | Delete sector | Admin
GET | `/api/v1/projects` | List projects | No
GET | `/api/v1/projects/:id` | Get project by ID | No
POST | `/api/v1/projects` | Create project | Admin
PUT | `/api/v1/projects/:id` | Update project | Admin
DELETE | `/api/v1/projects/:id` | Delete project | Admin
GET | `/api/v1/groups` | List groups with inventory counts | No
GET | `/api/v1/groups/:id` | Get group by ID | No
POST | `/api/v1/groups` | Create group | Admin
PUT | `/api/v1/groups/:id` | Update group | Admin
DELETE | `/api/v1/groups/:id` | Delete group and mappings | Admin
POST | `/api/v1/groups/add-inventories` | Add inventories to group(s) | Admin
POST | `/api/v1/groups/remove-inventories` | Remove inventories from group(s) | Admin
GET | `/api/v1/inventories` | Paginated inventory list | No
GET | `/api/v1/inventories/next-card-number` | Next free card number | No
GET | `/api/v1/inventories/:id` | Get inventory by ID | No
POST | `/api/v1/inventories` | Create inventory with optional image upload | Admin
PUT | `/api/v1/inventories/:id` | Update inventory with optional image upload | Admin
DELETE | `/api/v1/inventories/:id` | Delete inventory | Admin
GET | `/api/v1/images` | List image metadata | No
GET | `/api/v1/images/:id` | Get image metadata by ID | No
POST | `/api/v1/images` | Create image metadata | Admin
PUT | `/api/v1/images/:id` | Update image metadata | Admin
DELETE | `/api/v1/images/:id` | Delete image metadata | Admin
GET | `/api/v1/search/inventories` | Search inventories by keyword/type | No
GET | `/api/v1/search/suggest` | Suggest developers/sectors/projects/groups | No
POST | `/api/v1/interactions/save` | Save inventory for current user | Auth
DELETE | `/api/v1/interactions/unsave/:inventoryId` | Unsave inventory for current user | Auth
GET | `/api/v1/interactions/saved` | Get saved inventory IDs for user | Auth
POST | `/api/v1/interactions/report` | Report inventory item (public) | No
GET | `/api/v1/interactions/reports` | Get all reports (admin dashboard) | SuperAdmin
GET | `/api/v1/admin/users` | List all users with admin status | SuperAdmin
PATCH | `/api/v1/admin/users/:userId/toggle-admin` | Make/remove user as admin | SuperAdmin
PATCH | `/api/v1/admin/users/:userId/toggle-block` | Block/unblock user account | SuperAdmin

## Authentication & Authorization

### Auth Levels
- **No Auth**: Public endpoints (browse, search, report)
- **Auth**: Requires user login (save, unsave, view saved)
- **Admin**: Requires `Users.IsAdmin = 1`
- **SuperAdmin**: Requires `Users.IsSuperAdmin = 1` (user management only)

## Notes

- `POST /api/v1/inventories` and `PUT /api/v1/inventories/:id` use `upload.single('image')` and in-memory multer to accept image files.
- `POST /api/v1/interactions/report` is intentionally public; it records `UserId` only if the user is logged in.
- Report emails are sent asynchronously (fire-and-forget) and do not block API responses.
- SuperAdmin routes are protected by `requireSuperAdmin` middleware in `auth.middleware.js`.
- Admin gating is enforced by backend middleware `requireAdmin` in `auth.middleware.js`.
