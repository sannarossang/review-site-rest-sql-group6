const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { sequelize } = require("../database/config");
const { UnauthorizedError, NotFoundError } = require("../utils/errors");

exports.getAllReviews = async (req, res) => {
  const [results] = await sequelize.query(`SELECT * FROM reviews`);
  return res.json(results);
};

exports.getReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;

  const [results] = await sequelize.query(
    `SELECT id, review_text, review_score FROM reviews WHERE id = $reviewId;
		`,
    {
      bind: { reviewId: reviewId },
      type: QueryTypes.SELECT,
    }
  );

  if (!results) throw new NotFoundError("That review does not exists.");

  return res.json(results);
};

exports.createNewReview = async (req, res) => {
  const { review_text, review_score } = req.body;

  const [userResults] = await sequelize.query(
    `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user);`,
    {
      bind: { user: req.users.user_name },
    }
  );

  if (userResults.length === 0) {
    throw new NotFoundError("That user does not exists.");
  }

  const [tailorshopResult] = await sequelize.query(
    `SELECT * FROM tailorshops t
    WHERE t.id = $tailorshop;`,
    {
      bind: { tailorshop: req.params.tailorshopId },
    }
  );

  if (tailorshopResult.length === 0) {
    throw new NotFoundError("That tailorshop does not exists.");
  }

  const [newReviewId] = await sequelize.query(
    `INSERT INTO reviews (fk_user_id, fk_tailorshop_id, review_text, review_score) VALUES ($user, $id, $review, $score);`,
    {
      bind: {
        user: userResults[0].id,
        id: tailorshopResult[0].id,
        review: review_text,
        score: review_score,
      },
      type: QueryTypes.INSERT,
    }
  );

  return res
    .setHeader(
      "Location",
      `${req.protocol}://${req.headers.host}/api/v1/tailorshops/reviews/${newReviewId}`
    )
    .sendStatus(201);
};

exports.updateReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;
  const tailorshopId = req.params.tailorshopId;

  const { review_text, review_score } = req.body;

  const [userResults] = await sequelize.query(
    `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user) AND psw = $psw`,
    {
      bind: { user: req.users.user_name },
    }
  );

  if (userResults.length === 0) {
    throw new NotFoundError("That user does not exists.");
  }

  const [tailorshopResult] = await sequelize.query(
    `SELECT * FROM tailorshops t
    WHERE t.id = $tailorshopId;`,
    {
      bind: {
        tailorshopId,
      },
    }
  );

  const [reviewResult] = await sequelize.query(
    `SELECT * FROM reviews r
    WHERE r.id = $reviewId;`,
    {
      bind: {
        reviewId,
      },
    }
  );

  if (tailorshopResult.length === 0) {
    throw new NotFoundError("That tailorshop does not exists.");
  }

  if (reviewResult[0].fk_tailorshop_id !== tailorshopResult[0].id) {
    throw new NotFoundError("That review does not belong to this tailorshop");
  }

  if (
    userResults[0].id !== tailorshopResult[0].fk_user_id ||
    !userResults[0].is_admin
  ) {
    throw new UnauthorizedError("Your user does not own this tailorshop");
  }

  const [updatedReview] = await sequelize.query(
    `UPDATE reviews
    SET review_text = $review, review_score = $score, fk_user_id = $user, fk_tailorshop_id = $id
    WHERE id = $reviewId
    RETURNING *`,
    {
      bind: {
        user: userResults[0].id,
        id: tailorshopResult[0].id,
        review: review_text,
        score: review_score,
        reviewId: reviewId,
      },
    }
  );
  return res.json(updatedReview[0]);
};

exports.deleteReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;

  await sequelize.query(`DELETE FROM reviews WHERE id = $reviewId;`, {
    bind: { reviewId: reviewId },
    type: QueryTypes.DELETE,
  });
  return res.sendStatus(204);

  //måste hantera via användaren?
};
