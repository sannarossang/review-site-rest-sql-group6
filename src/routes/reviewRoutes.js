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
  "/tailorshop/reviews",
  /*isAuthenticated, authorizeRoles(userRoles.ADMIN)*/ getAllReviews
);
router.get("/tailorshop/:tailorshopId/reviews/:reviewId", /*isAuthenticated,*/ getReviewById);
router.post("/tailorshop/:tailorshopId/reviews", createNewReview);
router.put("/tailorshop/reviews/:reviewId", updateReviewById);
router.delete("/tailorshop/reviews/:reviewId", /*isAuthenticated,*/ deleteReviewById);

module.exports = router;
