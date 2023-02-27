const express = require("express");
const { userRoles } = require("../constants/users");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUserById,
  deleteUserById,
} = require("../controllers/userControllers");
// const {
//   isAuthenticated,
//   authorizeRoles,
// } = require("../middleware/authenticationMiddleware");

router.get(
  "/",
  /*isAuthenticated, authorizeRoles(userRoles.ADMIN)*/ getAllUsers
);
router.get("/:userId", /*isAuthenticated,*/ getUserById);
router.post("/", createNewUser); //petter har inte dessa i sitt repo
router.put("/:userId", updateUserById); //petter har inte dessa i sitt repo
router.delete("/:userId", /*isAuthenticated,*/ deleteUserById);

module.exports = router;
