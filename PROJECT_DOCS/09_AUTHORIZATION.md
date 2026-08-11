# AUTHENTICATION & AUTHORIZATION

## Login flow

### Google login
- Frontend sends `POST /api/v1/auth/google` with `{ idToken }`.
- Backend uses `google-auth-library` and `GOOGLE_CLIENT_ID` to verify the token.
- If user with the Google ID exists, it is reused.
- If no user exists but email already exists, that existing account is reused to avoid duplicates.
- If no existing account exists, a new `Users` record is created with `GoogleId`, `Email`, `Name`, and `Picture`.
- Backend creates a JWT signed with `JWT_SECRET` and sets it in the `auth_token` cookie.

### Email/password login
- Frontend sends `POST /api/v1/auth/login` with `{ email, password }`.
- Backend normalizes the email and looks up `Users.Email`.
- If the user exists and has a `PasswordHash`, password is compared with bcrypt.
- If valid, a JWT is issued and stored in `auth_token` cookie.

### Signup
- Frontend sends `POST /api/v1/auth/signup` with `{ email, password, name }`.
- Backend validates required fields and password length.
- If email is unused, a new user row is inserted with `PasswordHash`.
- JWT cookie is set after signup.

### Current user
- `GET /api/v1/auth/me` returns the currently authenticated user if JWT is valid.
- `AuthContext` calls this endpoint and stores user data.

### Logout
- `POST /api/v1/auth/logout` clears `auth_token` cookie.

## Cookie config

- Cookie name: `auth_token`
- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'none'` in production
- `sameSite: 'lax'` in development
- Cookie max age: 30 days

## Admin authority

- Admin status is stored in the database on the `Users` table as `IsAdmin`.
- There is no backend admin code in the `Users` table; if `IsAdmin = 1`, the user is admin.
- Admin status is assigned manually via SQL/SSMS by setting `Users.IsAdmin = 1`.

## Backend auth middleware

- `attachUser` reads `auth_token`, verifies JWT, and loads the user from the database.
- `requireAuth` rejects if `req.user` is missing.
- `requireAdmin` rejects if `req.user` is missing or `req.user.isAdmin` is falsy.

## Routes requiring auth vs admin

### requireAuth
- `POST /api/v1/interactions/save`
- `DELETE /api/v1/interactions/unsave/:inventoryId`
- `GET /api/v1/interactions/saved`

### requireAdmin
- `POST /api/v1/developers`
- `PUT /api/v1/developers/:id`
- `DELETE /api/v1/developers/:id`
- `POST /api/v1/sectors`
- `PUT /api/v1/sectors/:id`
- `DELETE /api/v1/sectors/:id`
- `POST /api/v1/projects`
- `PUT /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`
- `POST /api/v1/groups`
- `PUT /api/v1/groups/:id`
- `DELETE /api/v1/groups/:id`
- `POST /api/v1/groups/add-inventories`
- `POST /api/v1/groups/remove-inventories`
- `POST /api/v1/inventories`
- `PUT /api/v1/inventories/:id`
- `DELETE /api/v1/inventories/:id`
- `POST /api/v1/images`
- `PUT /api/v1/images/:id`
- `DELETE /api/v1/images/:id`
- `POST /api/v1/inventory-groups`
- `DELETE /api/v1/inventory-groups/:inventoryId/:groupId`

## Notes

- `interactions/report` is public and can be sent without login.
- Admin-only UI gating uses `AdminAuthContext` based on `user.isAdmin`, but backend routes enforce admin rights regardless of frontend gating.
- There is no separate admin login; admin is a property on the regular user record.
