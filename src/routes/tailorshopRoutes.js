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
  "/tailorshops",
  /*isAuthenticated, authorizeRoles(userRoles.ADMIN)*/ getAllTailorshops
);
router.get("/tailorshops/:tailorshopId", /*isAuthenticated,*/ getTailorshopById);
router.get("/tailorshops/:tailorshopId", /*isAuthenticated,*/ getTailorshopByCity);
router.post("/tailorshops", createNewTailorshop);
router.put("/tailorshops/:tailorshopId", updateTailorshopById);
router.delete("/tailorshops/:tailorshopId", /*isAuthenticated,*/ deleteTailorshopById);

module.exports = router;
