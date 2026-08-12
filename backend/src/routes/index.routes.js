const express = require("express");
const router = express.Router();
const developerRoutes = require("./developer.routes");
const sectorRoutes = require("./sector.routes");
const projectRoutes = require("./project.routes");
const groupRoutes = require("./group.routes");
const inventoryRoutes = require("./inventory.routes");
const imageRoutes = require("./image.routes");
const inventoryGroupRoutes = require("./Inventorygroup.routes");
const searchRoutes = require("./search.routes");
const authRoutes = require("./auth.routes");
const interactionsRoutes = require("./interactions.routes");   // ← naya
const adminRoutes = require("./admin.routes");   // ← naya
router.use("/auth", authRoutes);
router.use("/developers", developerRoutes);
router.use("/sectors", sectorRoutes);
router.use("/projects", projectRoutes);
router.use("/groups", groupRoutes);
router.use("/inventories", inventoryRoutes);
router.use("/images", imageRoutes);
router.use("/inventory-groups", inventoryGroupRoutes);
router.use("/search", searchRoutes);
router.use("/interactions", interactionsRoutes);   // ← naya
router.use("/admin", adminRoutes);   // ← naya

module.exports = router;