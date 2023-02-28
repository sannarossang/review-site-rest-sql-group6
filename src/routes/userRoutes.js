const express = require("express");
const { userRoles } = require("../constants/users");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUserById,
  deleteUserById,
} = require("../controllers/usersController");
// const {
//   isAuthenticated,
//   authorizeRoles,
// } = require("../middleware/authenticationMiddleware");

router.get(
  "/users",
  /*isAuthenticated, authorizeRoles(userRoles.ADMIN)*/ getAllUsers
);
router.get("/users/:userId", /*isAuthenticated,*/ getUserById);
router.post("/users", createNewUser); //petter har inte dessa i sitt repo
router.put("/users/:userId", updateUserById); //petter har inte dessa i sitt repo
router.delete("/users/:userId", /*isAuthenticated,*/ deleteUserById);

module.exports = router;
