const { QueryTypes } = require('sequelize')
const { userRoles } = require('../constants/users')
const { sequelize } = require('../database/config')
const { UnauthorizedError, NotFoundError } = require('../utils/errors')

exports.getAllReviews = async (req, res) => {
    let query;
    let options = {};
    query = `
    SELECT * FROM reviews`;
    const [results, metadata] = await sequelize.query(query, options);
    return res.json(results);
};

exports.getReviewById = async (req, res) => {
    const reviewId = req.params.reviewId

	const [results, metadata] = await sequelize.query(
		`
        SELECT id, review_text, review_score , fk_user_id, fk_tailorshop_id FROM reviews WHERE id = $reviewId;
		`,
		{
			bind: { reviewId: reviewId },
            type: QueryTypes.SELECT,
		}
	);

    if (!results) throw new NotFoundError("Den recensionen finns inte.");

	return res.json(results);
};

exports.createNewReview = async (req, res) => {};

exports.updateReviewById = async (req, res) => {};

exports.deleteReviewById = async (req, res) => {};
