const sequelize = require("sequelize");

exports.getAllTailorshops = async (req, res) => {};
exports.getTailorshopById = async (req, res) => {
    const tailorshopId = req.params.tailorshopId

    const [results, metadata] = await sequelize.query(
        `SELECT t.id, t.shop_name, t.shop_description, t.shop_address
        FROM tailorshops t
        LEFT JOIN reviews r ON r.fk_tailorshop_id = t.id
        WHERE t.id = $tailorshopId;`,
        {
            bind: { tailorshopId:tailorshopId },
        } 
    )

    if (!results || results.length == 0) {
		throw new NotFoundError('We could not find the list you are looking for')
	}
};
exports.getTailorshopByCity = async (req, res) => {};
exports.createNewTailorshop = async (req, res) => {};
exports.updateTailorshopById = async (req, res) => {};
exports.deleteTailorshopById = async (req, res) => {};
