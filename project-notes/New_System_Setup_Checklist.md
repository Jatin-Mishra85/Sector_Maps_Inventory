===== NAYA SYSTEM SETUP CHECKLIST — SECTOR MAPS INVENTORY =====
(Jab bhi project ko kisi NAYE PC/laptop par shuru karo, ye poori checklist
top se bottom follow karo. Isse wahi purani problems dobara nahi aayengi
jo pehle kai baar aa chuki hain.)

===== ZAROORI: PEHLE CONFIRM KARO CODE FIXES FILES MEIN HAIN =====

Ye 2 files mein permanent fixes already likhe hone chahiye (agar naye PC pe
GitHub/pendrive/cloud se project copy kiya hai to ye fixes already honi
chahiye code ke andar hi, kyunki ye "machine-specific" nahi hain):

1. `backend/src/repositories/inventory.repository.js`
   - `i.*` kahin bhi JOIN wali query mein NAHI hona chahiye. Uski jagah
     `INVENTORY_COLUMNS` naam ka constant use hona chahiye (explicit column
     list). Agar `i.*` dikhe, wapas "DeveloperName specified multiple
     times" jaisa crash aa sakta hai.

2. `frontend/src/features/inventory/hooks/useInventories.js`
   - `resolveImageUrl()` function mein regex wala fix hona chahiye jo
     `/uploads/filename.ext` nikaal kar current machine ke `STATIC_BASE_URL`
     se jodta hai. Agar ye function sirf `if (starts with http) return
     as-is` wala simple version hai (regex wala nahi), to purane machine ka
     hardcoded IP/hostname image URLs mein reh jayega aur naye PC pe images
     load nahi hongi.

Agar in dono mein se koi bhi purana/simple version dikhe, turant Claude/AI
ko batao "ye file purani hai, naya fix wapas lagao" — isi conversation ka
reference do.

===== STEP-BY-STEP: NAYE PC PAR SETUP KARNA =====

STEP 1 — Zaroori software install karo (agar pehle se nahi hai)
--------------------------------------------------------------
a) Node.js install karo (LTS version): https://nodejs.org
b) SQL Server Express (ya koi bhi SQL Server edition) install karo:
   https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - "Basic" installation choose karo, simple next-next.
   - Install ke baad connection string window mein instance ka naam
     note kar lo (jaise `localhost\SQLEXPRESS`, ya default instance ho to
     sirf `localhost`).
c) SSMS (SQL Server Management Studio) install karo:
   https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
d) VS Code install karo (agar nahi hai): https://code.visualstudio.com

STEP 2 — SQL Server ki 2 zaroori settings check karo
--------------------------------------------------------------
a) TCP/IP enable karo:
   - "SQL Server Configuration Manager" kholo (Start Menu search se, ya
     agar wahan na mile to `Windows + R` mein `SQLServerManager17.msc`
     ya `SQLServerManager16.msc` ya `SQLServerManager15.msc` try karo —
     jo bhi chal jaye).
   - Left side: "SQL Server Network Configuration" (32-bit wala NAHI,
     neeche wala normal) expand karo.
   - "Protocols for [instance name]" pe click karo.
   - Right side "TCP/IP" pe right-click → Enable (agar Disabled hai).
   - Isके baad SQL Server service RESTART karna zaroori hai (Step b dekho).

b) SQL Server service Running honi chahiye:
   - `Windows + R` → `services.msc` → Enter.
   - "SQL Server (MSSQLSERVER)" ya jo bhi instance naam ho — Status
     "Running" honi chahiye. Agar nahi, right-click → Start (ya TCP/IP
     change ke baad Restart).
   - "SQL Server Browser" bhi Running honi chahiye agar named instance
     use kar rahe ho (jaise SQLEXPRESS).

c) Authentication mode check karo (login errors se bachne ke liye):
   - SSMS mein server pe right-click → Properties → "Security" page.
   - "Server authentication" mein **"SQL Server and Windows Authentication
     mode"** selected hona chahiye (sirf "Windows Authentication mode" NAHI,
     warna koi bhi SQL login jaise testuser kabhi kaam nahi karega).
   - Agar change kiya to OK karo, phir SQL Server service Restart karo.

STEP 3 — Database restore karo (agar backup file hai)
--------------------------------------------------------------
a) `.bak` backup file ko naye PC par kahin copy karo (jaise `C:\backup\`).
b) SSMS mein: Databases pe right-click → Restore Database → Device →
   Add → apni `.bak` file select karo → Destination database name:
   `MapInventoryDB` → OK.

STEP 4 — `testuser` SQL login set karo (backup restore ke baad zaroori)
--------------------------------------------------------------
Backup restore karne ke baad `testuser` login prabhaan (orphaned) ho sakta
hai — matlab database ke andar user record hai, lekin server-level login
se sahi tarike se linked nahi hai. GUI se try karne par confusing errors
aate hain ("already exists" type) — isliye SEEDHA YE SCRIPT chalao SSMS
New Query mein (safe hai, har scenario handle karta hai):

```sql
USE MapInventoryDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'testuser')
BEGIN
    CREATE LOGIN testuser WITH PASSWORD = '!@#$%', CHECK_POLICY = OFF;
END
GO

IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'testuser')
BEGIN
    ALTER USER testuser WITH LOGIN = testuser;
END
ELSE
BEGIN
    CREATE USER testuser FOR LOGIN testuser;
END
GO

ALTER ROLE db_owner ADD MEMBER testuser;
GO

ALTER LOGIN testuser WITH PASSWORD = '!@#$%', CHECK_POLICY = OFF;
GO
```

Execute karne ke baad confirm karo:
```sql
SELECT name, type_desc FROM sys.server_principals WHERE name = 'testuser';
```
Ek row aani chahiye `SQL_LOGIN` type ke saath.

STEP 5 — `.env` file set karo
--------------------------------------------------------------
`backend/.env` file (agar missing/delete ho gayi ho, naya banao) mein
EXACTLY ye content hona chahiye:

```
PORT=8080
NODE_ENV=development

DB_USER=testuser
DB_PASSWORD="!@#$%"
DB_SERVER=localhost
DB_NAME=MapInventoryDB
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

⚠️ `DB_SERVER` value:
- Agar SQL Server **default instance** hai (jyada common case) → `localhost`
- Agar **named instance** hai (jaise SQL Express, `SERVERNAME\SQLEXPRESS`)
  → `DB_SERVER=localhost\SQLEXPRESS` likhna hoga

Confirm karne ka tarika: SSMS mein connect karte waqt "Server name" box mein
jo bhi type kiya (jaise `localhost`, ya `jack\jack1`), wahi (bina backslash
se pehle ke computer-naam ke, sirf instance part) `.env` mein daalo. Agar
confusion ho, seedha `localhost` try karo pehle (zyada common hai).

⚠️ Save karna mat bhoolna (`Ctrl+S`) — VS Code tab title pe agar dot/circle
dikhe (unsaved indicator), file abhi disk pe save nahi hui hai.

STEP 6 — Image uploads folder copy karo (agar purani images chahiye)
--------------------------------------------------------------
Database backup sirf TABLE DATA copy karta hai — actual image FILES nahi.
Agar purane PC ki images bhi naye PC pe dikhni hain:
1. Purane PC se poora `backend/public/uploads/` folder copy karo
2. Naye PC pe usi path (`backend/public/uploads/`) pe paste karo

Agar ye nahi kiya, purani images ke liye grey box/broken image dikhega
(normal hai, koi bug nahi) — sirf naye upload ki gayi images sahi dikhengi.
Code side se koi is problem ka permanent fix nahi hai kyunki files hi
physically missing hongi.

STEP 7 — Dependencies install karo
--------------------------------------------------------------
```
cd backend
npm install
cd ../frontend
npm install
```

STEP 8 — Backend aur Frontend start karo
--------------------------------------------------------------
Do alag terminals mein:
```
cd backend
npm run dev
```
```
cd frontend
npm run dev
```

Backend terminal mein ye 2 lines dikhni chahiye bina kisi error ke:
```
[INFO] Database connected successfully
[INFO] Server started successfully on port 8080 [development]
```

Agar "Failed to connect to localhost:1433" jaisa error aaye → Step 2 (TCP/IP
+ service running) wapas check karo.
Agar "Login failed for user testuser" (Error 18456) aaye → Step 4 (login
script) aur Step 2c (authentication mode) wapas check karo.

STEP 9 — Browser check
--------------------------------------------------------------
`http://localhost:5173` kholo, hard refresh karo (`Ctrl+Shift+R`).
Inventories list load honi chahiye. Agar "Unable to load data" dikhe,
backend terminal ka error dekho (wahi exact error bata dega problem kya
hai — DB column, connection, ya kuch aur).

===== QUICK REFERENCE — COMMON ERRORS AUR UNKA MATLAB =====

"Failed to connect to localhost:1433 - Could not connect (sequence)"
→ SQL Server service band hai, ya TCP/IP disabled hai, ya galat server
  name `.env` mein hai. (Step 2 + Step 5 dekho)

"Login failed for user 'testuser'. Error: 18456"
→ Login exist nahi karta, ya password galat hai, ya sirf "Windows
  Authentication mode" set hai. (Step 4 + Step 2c dekho)

"Create failed for Login/User 'testuser' — already exists"
→ GUI se manually banane ki koshish mat karo, seedha Step 4 wala SQL
  script chalao (wo hi safe/reliable tarika hai, har case handle karta hai)

"The column 'X' was specified multiple times for 'Sub'"
→ `inventory.repository.js` mein `i.*` reh gaya hai (purani file use ho
  rahi hai). `INVENTORY_COLUMNS` wala fix confirm karo.

"net::ERR_CONNECTION_REFUSED" (browser console mein)
→ Backend chal hi nahi raha (crash ho gaya ya terminal band hai). Backend
  terminal check karo, `npm run dev` dubara chalao.

Image grey box / broken image (kuch specific purani entries mein)
→ Normal hai agar `uploads` folder copy nahi hui (Step 6). Agar naye
  upload ki gayi image bhi grey dikhe, to `useInventories.js` ka
  `resolveImageUrl` fix check karo (upar "ZAROORI" section dekho).

===== YE CHECKLIST KAB USE KARNI HAI =====

- Naya PC/laptop mila hai aur project pehli baar set up kar rahe ho
- Windows reinstall hua hai
- SQL Server kisi wajah se reinstall/repair karna pada
- Kisi doosre AI/tool ko continue karne ke liye context dena hai naye
  system ke baare mein
