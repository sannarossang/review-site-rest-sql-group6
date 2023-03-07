const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/authenticationMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/usersController");



router.get( "/", isAuthenticated, getAllUsers) 
router.get("/:userId", getUserById);
router.put("/:userId", isAuthenticated, updateUserById); 
router.delete("/:userId", isAuthenticated, deleteUserById); 

module.exports = router;
