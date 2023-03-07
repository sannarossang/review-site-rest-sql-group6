const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createNewReview,
  updateReviewById,
  deleteReviewById,
} = require("../controllers/reviewController");
const {
  isAuthenticated,
} = require("../middleware/authenticationMiddleware");

router.get("/reviews", getAllReviews);
router.get("/reviews/:reviewId", getReviewById);
router.post("/:tailorshopId/reviews",  isAuthenticated,  createNewReview);
router.put(
  "/:tailorshopId/reviews/:reviewId",
  isAuthenticated,
  updateReviewById
);
router.delete("/reviews/:reviewId", isAuthenticated, deleteReviewById);

module.exports = router;
