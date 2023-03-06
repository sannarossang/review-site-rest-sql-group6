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



router.get( "/", isAuthenticated, getAllUsers) //hämtar data oavsätt om admin
router.get("/:userId", isAuthenticated, getUserById); //hämtar data för det konto som är inloggad bara
router.put("/:userId", isAuthenticated, updateUserById); 
router.delete("/:userId", isAuthenticated, deleteUserById); //FUNKAR INTE med auth. 

module.exports = router;
