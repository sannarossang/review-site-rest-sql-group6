const express = require("express");
const { userRoles } = require("../constants/users");
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createNewReview,
  updateReviewById,
  deleteReviewById,
} = require("../controllers/reviewController");
//   isAuthenticated,
//   authorizeRoles,
// } = require("../middleware/authenticationMiddleware");

router.get(
  "/",
  /*isAuthenticated, authorizeRoles(userRoles.ADMIN)*/ getAllReviews
);
router.get("/:reviewId", /*isAuthenticated,*/ getReviewById);
router.post("/", createNewReview);
router.put("/:reviewId", updateReviewById);
router.delete("/:reviewId", /*isAuthenticated,*/ deleteReviewById);
