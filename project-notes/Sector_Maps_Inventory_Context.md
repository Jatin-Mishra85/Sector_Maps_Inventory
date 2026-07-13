===== PROJECT CONTEXT — SECTOR MAPS INVENTORY (UPDATED VERSION) =====

Main "Sector_Maps_Inventory" naam ke real company project par kaam kar raha hu.
Path: C:\Users\HP\Desktop\Sector_Maps_Inventory
Windows machine, VS Code use karta hu, SSMS se DB manage karta hu.

STACK:
- Backend: Node.js + Express + MSSQL (mssql/tedious package)
- Frontend: React (Vite)
- DB: SQL Server (bahut PURANA version — sirf compatibility levels 80/90/100
  support karta hai, matlab SQL Server 2008 R2 ya usse bhi purana).
  Isliye OFFSET...FETCH NEXT syntax (SQL Server 2012+ wala) FAIL ho jata hai —
  hamesha ROW_NUMBER() OVER() wala purana pagination pattern use karna hoga.
- DB naam: MapInventoryDB
- Tables (SAB PLURAL naam se): Developers, Sectors, Inventories
- Backend chalane ka SAHI command: `cd backend` phir `npm run dev`
  (ya `npx nodemon src/server.js`). GALTI SE `npx nodemon server.js` root se
  MAT chalana — server.js sirf src/ folder ke andar hai, isse stale/wrong
  process load hoti hai aur bahut confusing purane errors wapas aate hain.

===== DATABASE ACTUAL SCHEMA (bahut zaroori — bahut baar isi wajah se
"Invalid column name" crash hue hain) =====

Developers table columns: DeveloperId, DeveloperName, CreatedAt, UpdatedAt,
IsDeleted
⚠️ Description column NAHI hai is table mein.

Sectors table columns: SectorId, DeveloperId, SectorName, CreatedAt,
UpdatedAt, IsDeleted
⚠️ Description column NAHI hai is table mein bhi.

Inventories table columns: InventoryId, DeveloperId, SectorId, InventoryType,
InventoryName, Description, ImageUrl, GoogleMapUrl, GoogleMapPolygon,
CreatedAt, UpdatedAt, IsDeleted
✅ Sirf Inventories table mein Description, ImageUrl, GoogleMapUrl,
GoogleMapPolygon hain — Developers/Sectors mein NAHI.
⚠️ InventoryType aur InventoryName columns NOT NULL hain (NULL allowed nahi) —
   isliye koi bhi UPDATE query in dono ko NULL bhejne ki koshish karegi to crash
   hoga. (Dekho fix #13 neeche — is wajah se ek bada bug aaya tha.)

RULE: Kabhi bhi koi repository file "Invalid column name" error de, to
PEHLE SSMS mein `USE MapInventoryDB; SELECT COLUMN_NAME FROM
INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '<table>';` chala kar exact
columns confirm karo — guess mat karo. (Dropdown "master" pe hone ki galti
bhi ho sakti hai — hamesha `USE MapInventoryDB; GO` likh kar query chalao
taaki galat DB pe na chale.)

===== USER KI CORE REQUIREMENT (bahut important, kabhi mat bhoolna) =====

User ko FORM PAR KOI RESTRICTION NAHI CHAHIYE. Developer name, Sector name,
Inventory Type — sab FREE TEXT hone chahiye, jo bhi manually type kare wahi
save ho jaye. Koi dropdown, koi fixed list, koi "must be one of X" validation
NAHI honi chahiye is business data ke liye.

Developer/Sector agar khaali chhode jaye form mein, to backend khud "Unknown
Developer"/"Unknown Sector" naam se record bana leta hai (findOrCreateByName
pattern) — ye already implement ho chuka hai (inventory.service.js mein
resolveDeveloperAndSector function).
⚠️ IMPORTANT NUANCE (fix #13 se seekha): ye resolveDeveloperAndSector function
SIRF tabhi call hona chahiye jab developerName/sectorName field actually
request mein bheji gayi ho (chahe khaali string ho). Agar EDIT/PARTIAL UPDATE
request mein ye fields hi nahi bheji gayi (field bilkul absent hai payload
mein), to unhe touch hi mat karo — warna existing Developer/Sector silently
"Unknown Developer"/"Unknown Sector" mein badal jaata hai, bina kisi error ke.
Ye bahut khatarnak silent-data-corruption bug hai, dobara mat aane dena.

===== AB TAK KE MAJOR FIXES (chronological, bahut lambi journey rahi hai) =====

1. Developer/Sector free text se auto-create: developer.repository.js aur
   sector.repository.js mein findOrCreateByName() functions bane.
   inventory.service.js ka resolveDeveloperAndSector() ye orchestrate karta
   hai — khaali naam par "Unknown Developer"/"Unknown Sector" use hota hai.

2. multer install + config: destination path `backend/public/uploads/`
   (root `backend/uploads` NAHI). app.js mein static serve hota hai
   `app.use('/uploads', express.static('public/uploads'));`.
   inventory.controller.js mein imageUrl banta hai seedha
   `req.file ? \`/uploads/${req.file.filename}\` : null` se.

3. Route ordering: inventory.routes.js mein `upload.single('image')`
   middleware HAMESHA validator SE PEHLE aana chahiye (POST aur PUT dono
   routes mein).

4. server.js location bug: asli server file hai `backend/src/server.js`.
   Root `backend/server.js` EXIST NAHI karti.

5. Pagination syntax: OFFSET...FETCH NEXT is purane SQL Server version mein
   kaam nahi karta. SABHI findAll/search functions ROW_NUMBER() OVER()
   pattern se rewrite kiye gaye hain. Agar koi naya list/pagination endpoint
   banaye, ISI pattern se banana.

6. Type/Name validation restrictions removed: inventory.validator.js mein
   sab fields `.optional()` hain, koi `.isIn()` restriction nahi.

7. GoogleMapUrl column: naya feature, column DB mein add kiya gaya
   (`ALTER TABLE Inventories ADD GoogleMapUrl NVARCHAR(500) NULL;`).

8. Frontend apiClient.js response interceptor already `response.data`
   return karta hai. Backend ka actual shape hamesha
   `{ success, message, data: { items, pagination } }` hota hai. Kisi bhi
   naye hook mein SAHI PATTERN:
   ```javascript
   const response = await someService.getSomething(params);
   const payload = response?.data ?? {};
   const items = Array.isArray(payload) ? payload : payload?.items || [];
   const total = payload?.pagination?.total ?? items.length;
   ```

9. FIELD NAME MISMATCH: Backend PascalCase→camelCase deta hai
   (`inventoryId`, `inventoryName`, `developerName` etc.) lekin components
   `id`, `name`, `googleMapsUrl` (extra "s"!) expect karte hain. Har list/hook
   mein ek `mapX(item)` function banana padta hai jo backend fields ko
   frontend-expected names mein map kare, items set karne se pehle.
   ⚠️ Ye pattern HAR list ke liye alag se lagana padta hai — sirf
   useInventories.js mein karne se kaam nahi chalta. useDevelopers.js mein
   bhi ye missing tha (fix #10 dekho).

10. useDevelopers.js mein bhi field mapping missing thi (fix #9 ka wahi bug,
    developers list ke liye). Fix: `mapDeveloper(item)` function add kiya
    (`id: item.developerId, name: item.developerName`), taaki
    DeveloperFilterChips.jsx ko sahi `dev.id`/`dev.name` milein. Ab
    developer chips theek se dikh rahe hain.

11. Type filter (funnel icon) — PEHLE fixed kiya gaya tha (dynamic options
    HomePage se distinct inventory types nikal kar TypeFilterButton ko
    diye jaate the), LEKIN user ne baad mein decide kiya ki ye feature
    hi NAHI CHAHIYE, kyunki neeche Developer chips already grouping/filter
    ka kaam kar rahe hain. Isliye TypeFilterButton POORI TARAH SE HATA DIYA
    GAYA HAI HomePage.jsx se (import, state, aur JSX teeno hataye gaye).
    ⚠️ Agar future mein koi TypeFilterButton.jsx file dubara use karne ki
    baat kare ya wapas laane ki koshish kare — pehle confirm karo ki user
    ne khud manga hai, kyunki ye jaan-boojh kar remove kiya gaya feature hai.

12. Image grey box / broken image fix: `env.js` mein `API_BASE_URL` hamesha
    `/api/v1` suffix ke saath hai, lekin images `/uploads/...` par bina
    `/api/v1` ke serve hoti hain. Isliye ek alag `STATIC_BASE_URL` (bina
    `/api/v1` suffix) env.js mein add kiya gaya, aur useInventories.js mein
    `resolveImageUrl()` function banaya jo relative `imageUrl` ko
    `STATIC_BASE_URL + imageUrl` bana kar poora URL deta hai
    (agar already `http://` se start ho raha hai to as-is chhod deta hai).

13. **BAHUT BADA BUG — Edit modal se partial update crash + silent data
    corruption (abhi-abhi fix hua)**:
    `EditInventoryModal.jsx` (TEMPORARY component, Admin Panel banne tak ke
    liye) sirf `name`, `description`, `image` fields bhejta hai — baaki
    (type, developerName, sectorName, googleMapUrl, polygon) bilkul nahi
    bhejta. Lekin backend ka `updateInventory` (controller + service +
    repository) pehle **hamesha SAARE fields overwrite** karta tha, chahe
    request mein aaye ho ya nahi:
    - `InventoryType`/`InventoryName` undefined → SQL NULL → DB crash
      ("Cannot insert the value NULL into column 'InventoryType'")
      kyunki ye columns NOT NULL hain.
    - Developer/Sector silently "Unknown Developer"/"Unknown Sector" mein
      badal jaate the (kyunki resolveDeveloperAndSector hamesha call hota
      tha, chahe naam bheja gaya ho ya nahi) — DATA CORRUPTION bina kisi
      error ke.
    - ImageUrl bhi NULL ho jaata agar naya image upload na kiya jaye
      (existing image delete ho jaati thi).

    FIX (isi pattern se koi bhi future partial-update endpoint banana):
    - Controller (`inventory.controller.js`, `updateInventory`): payload
      mein SIRF wahi keys daalo jo `req.body`/`req.file` mein actually
      present hain (`!== undefined` check). Missing field ko payload mein
      daalo hi mat, null bhi mat karo.
    - Service (`inventory.service.js`, `updateInventory`): pehle
      `existing = await inventoryRepository.findById(inventoryId)` se
      purana record fetch karo. Phir har field ke liye:
      `payload.field !== undefined ? payload.field : existing.Field`
      (existing value fallback). `resolveDeveloperAndSector` SIRF tabhi
      call hoga jab `payload.developerName !== undefined ||
      payload.sectorName !== undefined` ho.
    - Repository (`inventory.repository.js`) mein koi change nahi kiya —
      wo already poora object accept karta hai, bas ab service usko poora
      hi bana kar bhejta hai (missing values ko purani DB values se fill
      karke).

    ⚠️ YE PATTERN YAAD RAKHO: is codebase mein "temporary partial-update UI"
    (jaise EditInventoryModal) aur "full-overwrite backend repository"
    ka combo hamesha ye risk create karta hai. Koi bhi naya partial-edit
    feature banate waqt, service layer mein hamesha existing-record-merge
    logic lagani hai, sirf request payload par blindly trust nahi karna.

14. DB poori tarah khali karne ka command (jab testing ke liye fresh state
    chahiye ho):
    ```sql
    USE MapInventoryDB;
    GO
    DELETE FROM Inventories;
    DELETE FROM Sectors;
    DELETE FROM Developers;
    DBCC CHECKIDENT ('Inventories', RESEED, 0);
    DBCC CHECKIDENT ('Sectors', RESEED, 0);
    DBCC CHECKIDENT ('Developers', RESEED, 0);
    ```
    ⚠️ Ye permanent hai, backup na ho to data wapas nahi aayega.

===== ABHI KA STATUS (jahan hum ruke hain) =====

DONE / WORKING:
- Backend crashes fix ho chuke hain, save/create/list sab kaam kar raha hai.
- Home page par inventories list ho rahi hain, "No inventories found" bug
  fix ho chuka hai.
- Developer filter chips ab sahi naam/count ke saath dikh rahe hain (fix #10).
- Type filter (funnel icon) permanently REMOVE kar diya gaya hai — user ki
  request par, kyunki Developer chips already grouping ka kaam kar rahe hain.
  Iska UI (search bar ke bagal wala funnel icon) ab HomePage.jsx mein nahi hai.
- Images ab load ho rahi hain (STATIC_BASE_URL prepend fix, #12) — user ne
  screenshot mein confirm kiya ki kuch images dikh rahi hain (baaki jinke
  liye actually upload nahi hui thi, unke liye grey box normal hai).
- Edit modal (image/description quick-edit) ka NULL crash aur silent
  Developer/Sector corruption bug dono fix ho chuke hain (#13) — is fix
  ke baad test karna abhi baaki hai (verify pending).

IN PROGRESS (abhi banaya ja raha hai, is session mein):
- **TEMPORARY HARD-DELETE FEATURE**: User ko ek quick delete button chahiye
  InventoryCard par (jaise temporary Edit button hai — same "remove once
  Admin Panel ships" comment ke saath), jisse:
  - Click karne par confirmation popup aaye ("Are you sure? Ye permanent hai")
  - Confirm karne par backend se us Inventory record ko **HARD DELETE**
    kiya jaye (actual `DELETE FROM Inventories WHERE InventoryId = ...`,
    NOT soft delete/IsDeleted flag) — user ne explicitly HARD DELETE
    choose kiya hai (Q&A mein confirm hua), soft delete nahi.
  - Use-case: galti se galat/duplicate entry ban jati hai form submit karte
    waqt, ussey turant UI se hatana hai bina SSMS query chalaye.
  - Existing backend mein already ek `deleteInventory` controller/service/
    repository hai jo SOFT delete karta hai (`IsDeleted = 1` set karta hai)
    — is naye hard-delete feature ke liye ALAG route/function banani hai
    (soft-delete wala existing code na chhedo, kahin aur use ho sakta hai).
  - IMPLEMENTATION ABHI PENDING HAI — inventory.routes.js aur frontend
    inventoryService.js files maangi gayi thi (existing pattern follow
    karne ke liye) lekin user ne abhi tak bheji nahi hain. Agla step: wo
    2 files lo, phir:
    (a) backend mein naya hard-delete repository function + route add karo
    (b) frontend mein delete button + confirm dialog + service call add karo
    (c) InventoryCard.jsx mein delete button add karo (jaise temporary Edit
    button hai, waise hi "TEMPORARY — remove once Admin Panel ships" comment
    ke saath)

NEXT STEPS (jab ye conversation continue ho):
1. Pehle hard-delete feature complete karo (upar wala IN PROGRESS item).
2. Fix #13 (Edit modal) ka manual test verify karo — image/description edit
   karke confirm karo ki Developer/Sector change nahi ho raha aur crash nahi
   aa raha.
3. Agar future mein user Admin Panel banane ko kahe, to EditInventoryModal
   AND naya delete button dono hata kar proper Admin Panel se replace karna
   hai (dono jagah "TEMPORARY" comments hain jo isko clearly mark karte hain).

===== IMPORTANT WARNING — PAST INCIDENT =====

Ek baar user ne ek doosre AI/tool ko is project ka context diya tha continue
karne ke liye. Us doosre AI ne, context poora na samajhne ki wajah se,
KUCH PURANE FIXED BUGS WAPAS LA DIYE — jaise:
- sector.repository.js/developer.repository.js mein Description column
  wapas add ho gaya (jo exist nahi karta)
- inventory.validator.js mein hataye gaye restrictions (isIn, notEmpty)
  wapas aa gaye
- Table name comment mein confusion ("FIXED — was 'Inventories'" jabki
  asal mein 'Inventories' hi sahi naam hai, singular 'Inventory' galat hai)

ISLIYE: Agar koi purana fixed bug FIR SE dikhe (jaise "Invalid column name
Description" ya koi validation jo pehle hata di gayi thi, ya Type filter
funnel icon wapas dikhne lage, ya koi Developer/Sector silently "Unknown"
ban jaye), sabse pehla shaq ye karo ki koi file kisi purane/galat version
mein wapas badal gayi hai — poori file ka current content maango aur upar
diye gaye "DATABASE ACTUAL SCHEMA", "USER KI CORE REQUIREMENT", aur
"AB TAK KE MAJOR FIXES" ke against compare karo, sirf error message ke
hisaab se blindly naya fix mat likho.

===== MUJHSE BAAT KARNE KA TAREEKA =====

- Hindi (Hinglish) mein casual dost jaisa baat karo, technical jargon simple
  bhasha mein samjhao.
- Code fixes hamesha POORI file do (partial diff/snippet nahi — confusion
  hoti hai). File ka EXACT path/address bhi batao.
- Pehle root cause simple shabdon mein samjhao, phir fix do.
- Main non-technical/beginner level ka hu — commands exact copy-paste karne
  layak do, kya karna hai step-by-step batao.
- Jab bhi koi file maango to specific path bata do taaki main sahi file
  dhoondh sakoon (mujhe kabhi khud guess nahi karna padta kaunsi file hai).
- Agar koi error aaye jiska matlab samajh na aaye, pehle SSMS query se DB
  confirm karne ko kaho (guess mat karo), phir fix do.
- Kisi bhi naye feature ko fix karne se PEHLE related existing files maango
  (jaise routes, service, ya component jo already existing pattern use kar
  raha ho) — blindly naya alag pattern mat likho, existing codebase ke
  conventions follow karo.
