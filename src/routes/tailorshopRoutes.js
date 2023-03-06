const express = require("express");
const router = express.Router();
const {
  getAllTailorshops,
  getTailorshopById,
  getTailorshopByCity,
  createNewTailorshop,
  updateTailorshopById,
  deleteTailorshopById,
} = require("../controllers/tailorshopController");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/authenticationMiddleware");

router.get("/", getAllTailorshops);
router.get("/:tailorshopId", getTailorshopById);
router.get("/city/:city", getTailorshopByCity);
router.post("/", isAuthenticated, createNewTailorshop);
router.put("/:tailorshopId", isAuthenticated, updateTailorshopById);
router.delete("/:tailorshopId", isAuthenticated, deleteTailorshopById);

module.exports = router;
