const { QueryTypes } = require("sequelize");
const { sequelize } = require("../database/config");
const { UnauthorizedError, NotFoundError, BadRequestError } = require("../utils/errors");

exports.getAllReviews = async (req, res) => {
  try{
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);
    const tailorshop = req.query.shop_name;
    const reviewScore = req.query.review_score;


    if (!tailorshop && !reviewScore) {
      const [results] = await sequelize.query(
        `SELECT r.id, r.review_text, t.shop_name, r.review_score, r.fk_user_id, r.fk_tailorshop_id
         FROM reviews r
         JOIN tailorshops t ON r.fk_tailorshop_id = t.id
         ORDER BY r.id ASC
         LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            shop_name: tailorshop,
            limit: limit,
            offset: offset,
          },
        }
      );      
      if (!results || !results[0]) {
        throw new NotFoundError("We can't find any reviews");
      }
      return res.json({
        data: results,
        metadata: {
          limit: limit,
          offset: offset,
        },
      });
    } else if(tailorshop && !reviewScore){
      const [results] = await sequelize.query(
        `SELECT r.id, r.review_text, t.shop_name, r.review_score, r.fk_user_id, r.fk_tailorshop_id
         FROM reviews r
         JOIN tailorshops t ON r.fk_tailorshop_id = t.id
         WHERE t.shop_name = $shop_name
         ORDER BY r.id ASC
         LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            shop_name: tailorshop,
            limit: limit,
            offset: offset,
          },
        }
      );      
       if (results.length == 0) {
        throw new NotFoundError("There is no reviews for that tailorshop");
      }
      return res.json({
        data: results,
        metadata: {
          limit: limit,
          offset: offset,
        },
      });
    } else if(!tailorshop && reviewScore){
      if (!/^\d+$/.test(reviewScore) || reviewScore > 5) {
        throw new BadRequestError("Input is invalid");
      }
      
      const [results] = await sequelize.query(
        `SELECT r.id, r.review_text, t.shop_name, r.review_score, r.fk_user_id, r.fk_tailorshop_id
         FROM reviews r
         JOIN tailorshops t ON r.fk_tailorshop_id = t.id
         WHERE r.review_score = $review_score
         ORDER BY r.id ASC
         LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            review_score: reviewScore,
            limit: limit,
            offset: offset,
          },
        }
      );
      return res.json({
        data: results,
        metadata: {
          limit: limit,
          offset: offset,
        },  
      });
    }
    else if(tailorshop && reviewScore){
      if (!/^\d+$/.test(reviewScore) || reviewScore > 5) {
        throw new BadRequestError("Input is invalid");
      }
      const [results] = await sequelize.query(
        `SELECT r.id, r.review_text, t.shop_name, r.review_score, r.fk_user_id, r.fk_tailorshop_id
         FROM reviews r
         JOIN tailorshops t ON r.fk_tailorshop_id = t.id
         WHERE r.review_score = $review_score
         AND t.shop_name = $shop_name
         ORDER BY r.id ASC
         LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            shop_name: tailorshop,
            review_score: reviewScore,
            limit: limit,
            offset: offset,
          },
        }
      );
      if (!reviewScore || reviewScore > 5) {
        throw new NotFoundError("No results found");
      }
      return res.json({
        data: results,
        metadata: {
          limit: limit,
          offset: offset,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try{
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
  }catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.createNewReview = async (req, res) => {
  try {
    const { review_text, review_score } = req.body;

    const [userResults] = await sequelize.query(
      `SELECT * FROM users u
      WHERE UPPER(u.user_name) = UPPER($user);`,
      {
        bind: { user: req.users.user_name },
      }
    );

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
  }catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateReviewById = async (req, res) => {
  try{
    const reviewId = req.params.reviewId;
    const tailorshopId = req.params.tailorshopId;

    const { review_text, review_score } = req.body;

    const [userResults] = await sequelize.query(
      `SELECT * FROM users u
      WHERE UPPER(u.user_name) = UPPER($user)`,
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



    if (
      !userResults[0].is_admin &&
      userResults[0].id !== reviewResult[0].fk_user_id
    ) {
      throw new UnauthorizedError(
        "You are not allowed to update this review"
      );
    } else {

    if (tailorshopResult.length === 0) {
      throw new NotFoundError("That tailorshop does not exists.");
    }

    if (reviewResult[0].fk_tailorshop_id !== tailorshopResult[0].id) {
      throw new BadRequestError("That review does not belong to this tailorshop");
    }

    if (
      !req.users.is_admin 
      && userResults[0].id !== reviewResult[0].fk_user_id 
    ) {
      throw new UnauthorizedError("Your user does not own this review");
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
  }
  }catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  } 
};

exports.deleteReviewById = async (req, res) => {
  try{
    const reviewId = req.params.reviewId;

    const [userResults] = await sequelize.query(
      `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user);`,
      {
        bind: { user: req.users.user_name },
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
    if (reviewResult.length === 0) {
      throw new NotFoundError("That review does not exist!")
    }

    if (
      userResults[0].is_admin ||
      userResults[0].id == reviewResult[0].fk_user_id
    ) {
      await sequelize.query(`DELETE FROM reviews WHERE id = $reviewId;`, {
        bind: { reviewId: reviewId },
        type: QueryTypes.DELETE,
      });
    } else{
      throw new UnauthorizedError(
        "You are not allowed to delete this review"
      );
    }
    return res.sendStatus(204);
  }catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
