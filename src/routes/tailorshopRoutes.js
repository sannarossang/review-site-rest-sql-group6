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

router.get("/", isAuthenticated, getAllTailorshops);
router.get("/:tailorshopId", isAuthenticated, getTailorshopById);
router.get("/city/:city", isAuthenticated, getTailorshopByCity);
router.post("/", isAuthenticated, createNewTailorshop);
router.put("/:tailorshopId", isAuthenticated, updateTailorshopById);
router.delete("/:tailorshopId", isAuthenticated, deleteTailorshopById);

module.exports = router;
