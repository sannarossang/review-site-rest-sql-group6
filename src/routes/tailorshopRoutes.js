const express = require("express");
const { userRoles } = require("../constants/users");
const router = express.Router();
const {
  getAllTailorshops,
  getTailorshopById,
  getTailorshopByCity,
  createNewTailorshop,
  updateTailorshopById,
  deleteTailorshopById,
} = require("../controllers/tailorshopController");
// const {
//   isAuthenticated,
//   authorizeRoles,
// } = require("../middleware/authenticationMiddleware");

router.get(
  "/",
  /*isAuthenticated, authorizeRoles(userRoles.ADMIN)*/ getAllTailorshops
);
router.get("/:tailorshopId", /*isAuthenticated,*/ getTailorshopById);
router.get("/city/:city", /*isAuthenticated,*/ getTailorshopByCity);
router.post("/", createNewTailorshop);
router.put("/:tailorshopId", updateTailorshopById);
router.delete("/:tailorshopId", /*isAuthenticated,*/ deleteTailorshopById);

module.exports = router;
