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
  isAuthenticated
} = require("../middleware/authenticationMiddleware");

router.get("/", getAllTailorshops);
router.get("/:tailorshopId", getTailorshopById);
router.get("/cities/:city", getTailorshopByCity);
router.post("/", isAuthenticated, createNewTailorshop);
router.put("/:tailorshopId", isAuthenticated, updateTailorshopById);
router.delete("/:tailorshopId", isAuthenticated, deleteTailorshopById);

module.exports = router;
