# 🚀 Quick Start Guide - Sector Maps Inventory

## 📌 One-Minute Overview

**What**: Real estate inventory management system  
**For**: Developers, clients, and admin users  
**Tech**: React + Node.js + MSSQL + Azure

---

## ⚡ Quick Setup (5 minutes)

### 1. **Clone & Install**
```bash
git clone <repo>
cd Sector_Maps_Inventory
cd backend && npm install && cd ../frontend && npm install
```

### 2. **Create Environment Files**
```bash
# backend/.env
DB_HOST=your-sql-server
DB_USER=sa
DB_PASSWORD=password
DB_NAME=inventory_db
JWT_SECRET=your-random-key
GOOGLE_CLIENT_ID=your-google-id
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password

# frontend/.env
VITE_API_HOST=http://localhost:5000
VITE_API_PREFIX=/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-id
```

### 3. **Start Services**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

✅ **Done!** Open http://localhost:5173

---

## 🎯 Key Features at a Glance

| Feature | What It Does | User Type |
|---------|-------------|-----------|
| 🔍 **Search** | Find properties by keyword | Everyone |
| 📌 **Save** | Bookmark favorite items | Logged-in users |
| 📊 **Groups** | Tag & organize inventory | Admin |
| 📤 **Upload** | Add images to properties | Admin |
| 📧 **Report** | Flag problematic listings | Everyone |
| 🔐 **Auth** | Google OAuth + Email login | Everyone |

---

## 📊 Project Structure (Simple View)

```
Project/
├── backend/          → Node.js API (Port 5000)
│   ├── controllers/  → Handle requests
│   ├── services/     → Business logic
│   ├── repositories/ → Database queries
│   └── config/       → Settings
├── frontend/         → React App (Port 5173)
│   ├── pages/        → Full screens
│   ├── components/   → UI pieces
│   ├── context/      → Global state
│   └── services/     → API calls
└── PROJECT_DOCS/     → Detailed docs
```

---

## 🔌 API Endpoints Quick Reference

### Public (No Auth Needed)
```
GET   /api/v1/inventories          → List all items
GET   /api/v1/developers            → List developers
GET   /api/v1/search/inventories    → Search
POST  /api/v1/interactions/report   → Report item
```

### Authenticated Users
```
POST   /api/v1/interactions/save    → Save item
DELETE /api/v1/interactions/unsave/:id → Unsave
GET    /api/v1/interactions/saved   → My saved items
```

### Admin Only
```
POST   /api/v1/inventories         → Create item
PUT    /api/v1/inventories/:id     → Update item
DELETE /api/v1/inventories/:id     → Delete item
POST   /api/v1/groups/add-inventories → Tag items
```

---

## 👥 User Roles

| Role | Can Do |
|------|--------|
| **Guest** | Browse & search inventory, report issues |
| **User** | + Save favorites, view saved list |
| **Admin** | + Create/edit/delete, manage groups, verify reports |

---

## 🛠️ Important Files to Know

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Backend entry point |
| `backend/src/app.js` | Express setup |
| `frontend/src/main.jsx` | Frontend entry point |
| `frontend/src/app/AppProviders.jsx` | Global setup |
| `backend/.env` | Backend config |
| `frontend/.env` | Frontend config |

---

## ⚡ Common Commands

```bash
# Development
cd backend && npm run dev          # Backend with auto-reload
cd frontend && npm run dev         # Frontend with hot-reload

# Production
cd backend && npm start            # Backend server
cd frontend && npm run build       # Build for production

# Code Quality
npm run lint                       # Check code issues
npm run lint --fix                # Fix issues automatically
```

---

## 🐛 Known Issues (Fix These First!)

| Issue | Location | Fix Time |
|-------|----------|----------|
| ❌ Duplicate function | `backend/services/interactions.service.js` | 30 min |
| ❌ Wrong API call | `frontend/components/InventoryGrid.jsx` | 1 hour |
| ❌ Debug logs | `backend/repositories/group.repository.js` | 15 min |

---

## 📚 Full Documentation

- **Setup Guide** → README.md
- **Architecture** → PROJECT_DOCS/02_FRONTEND_STRUCTURE.md & 03_BACKEND_STRUCTURE.md
- **Database** → PROJECT_DOCS/08_DATABASE_SCHEMA.md
- **API Details** → PROJECT_DOCS/04_API_ENDPOINTS.md
- **Features** → PROJECT_DOCS/05_KEY_FEATURES.md
- **Deployment** → PROJECT_DOCS/10_DEPLOYMENT.md

---

## 🎓 Learning Path

**New to the project?** Read in this order:
1. This file (you're reading it! ✓)
2. README.md → Full overview
3. PROJECT_DOCS/01_OVERVIEW.md → Project context
4. PROJECT_DOCS/02_FRONTEND_STRUCTURE.md → Frontend details
5. PROJECT_DOCS/03_BACKEND_STRUCTURE.md → Backend details

---

## ✅ Deployment Checklist

- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Google OAuth credentials added
- [ ] Azure Blob Storage configured
- [ ] Email service configured
- [ ] Frontend built (`npm run build`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Test login works
- [ ] Test upload works
- [ ] Test search works

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to database"
```
→ Check DB_HOST, DB_USER, DB_PASSWORD in .env
→ Verify SQL Server is running
→ Check firewall/network access
```

### Issue: "Google login fails"
```
→ Verify GOOGLE_CLIENT_ID in .env
→ Check Google OAuth credentials
→ Ensure frontend URL is in Google allowed list
```

### Issue: "Image upload fails"
```
→ Check Azure credentials in .env
→ Verify container exists: "uploads"
→ Check file size limits (max 5MB)
```

### Issue: Frontend shows blank page
```
→ Check browser console for errors
→ Verify backend is running: http://localhost:5000/health
→ Check VITE_API_HOST in .env
```

---

## 💡 Pro Tips

✨ **Keep terminal output clean**: Use separate terminals for backend and frontend  
✨ **Use VS Code extensions**: ESLint + Prettier for automatic formatting  
✨ **Check health endpoint**: `curl http://localhost:5000/health` to verify backend  
✨ **Database tools**: Use SQL Server Management Studio (SSMS) to browse database  
✨ **API testing**: Use Postman/Insomnia to test endpoints manually  

---

**Need help?** Check PROJECT_DOCS/ folder or review the detailed README.md
