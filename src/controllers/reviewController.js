const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const { sequelize } = require("../database/config");
const { UnauthorizedError, NotFoundError } = require("../utils/errors");

exports.getAllReviews = async (req, res) => {
  const [results] = await sequelize.query(`SELECT * FROM reviews`); //ev plocka bort fk-värden och speca?
  return res.json(results);
};

exports.getReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;

  const [results, metadata] = await sequelize.query(
    `SELECT id, review_text, review_score, fk_user_id, fk_tailorshop_id FROM reviews WHERE id = $reviewId;
		`,
    {
      bind: { reviewId: reviewId },
      type: QueryTypes.SELECT,
    }
  );

  if (!results) throw new NotFoundError("Den recensionen finns inte.");

  return res.json(results);
};

exports.createNewReview = async (req, res) => {
  const { review_text, review_score, user_name, tailorshop } = req.body; //ska inte den ha tailorshop? hur blir det med req.params

  //user_name bör bytas ut när auth är på plats, annars kan man skriva in vad som

  const [userResults] = await sequelize.query(
    `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user);`,
    {
      bind: { user: user_name },
    }
  );
  if (userResults.length === 0) {
    //returnera badrequest att användaren inte finns
  }

  const [tailorshopResult] = await sequelize.query(
    `SELECT * FROM tailorshops t
    WHERE t.id = $tailorshop;`,
    {
      bind: { tailorshop: req.params.tailorshopId },
    }
  );

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

  const { review_text, review_score, user_name } = req.body;

  console.log(tailorshopId);

  //user_name bör bytas ut när auth är på plats, annars kan man skriva in vad som

  const [userResults] = await sequelize.query(
    `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user);`,
    {
      bind: { user: user_name },
    }
  );
  if (userResults.length === 0) {
    //returnera badrequest att användaren inte finns
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
  return res.json(updatedReview);
};

exports.deleteReviewById = async (req, res) => {
  const reviewId = req.params.reviewId;

  await sequelize.query(`DELETE FROM reviews WHERE id = $reviewId;`, {
    bind: { reviewId: reviewId },
    type: QueryTypes.DELETE,
  });
  return res.sendStatus(204);
};
