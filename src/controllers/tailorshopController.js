const { QueryTypes } = require("sequelize");
const { sequelize } = require("../database/config");
const { NotFoundError, UnauthorizedError, BadRequestError } = require("../utils/errors");

exports.getAllTailorshops = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);
    const city = req.query.city_name;
    const review = req.query.review_score;

    if (!city && !review) {
     
      const [tailorshops] = await sequelize.query(
        `SELECT t.id, t.shop_name, t.shop_description, t.shop_address, c.city_name
        FROM tailorshops t, cities c
        WHERE c.id = t.fk_city_id 
        ORDER BY shop_name ASC 
        LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            limit: limit,
            offset: offset,
          },
        }
      );
      if (!tailorshops || !tailorshops[0]) {
        throw new NotFoundError("We can't find any tailorshops");
      }
      return res.json({ data: tailorshops });

    } else if (city !== undefined && !review) {
      const [tailorshops, metadata] = await sequelize.query(
        `SELECT t.id, t.shop_name, t.shop_description, t.shop_address, c.city_name
        FROM tailorshops t, cities c
        WHERE c.id = t.fk_city_id 
        AND UPPER(c.city_name) = UPPER($city_name)
        ORDER BY shop_name ASC 
        LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            city_name: city,
            limit: limit,
            offset: offset,
          },
        }
      );

      if (tailorshops.length == 0) {
        throw new NotFoundError("There is no tailorshops listed in that city");
      }
      return res.json({
        data: tailorshops,
        metadata: {
          limit: limit,
          offset: offset,
        },
      });

    } else if (review !== undefined && !city) {
      if (!/^\d+$/.test(review) || review > 5) {
        throw new BadRequestError("Input is invalid");
      }
 
      const [tailorshops, metadata] = await sequelize.query(
        `SELECT t.id, t.shop_name, t.shop_description, t.shop_address, c.city_name 
        FROM tailorshops t, cities c
        WHERE c.id = t.fk_city_id 
        AND t.id IN (select r.fk_tailorshop_id FROM reviews r WHERE r.review_score  = $review_score) 
        ORDER BY shop_name ASC 
        LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            review_score: review,
            limit: limit,
            offset: offset,
          },
        }
      );
      return res.json({
        data: tailorshops,
        metadata: {
          limit: limit,
          offset: offset,
        },
      });
    } else {
     
      const [tailorshops, metadata] = await sequelize.query(
        `SELECT t.id, t.shop_name, t.shop_description, t.shop_address, c.city_name 
        FROM tailorshops t, cities c
        WHERE c.id = t.fk_city_id 
        AND t.id IN (select r.fk_tailorshop_id FROM reviews r WHERE r.review_score  = $review_score) 
        AND UPPER(c.city_name) = UPPER($city_name)
        ORDER BY shop_name ASC 
        LIMIT $limit OFFSET $offset;`,
        {
          bind: {
            city_name: city,
            review_score: review,
            limit: limit,
            offset: offset,
          },
        }
      );
      if (!review || review > 5) {
        throw new NotFoundError("No results found");
      }
      return res.json({
        data: tailorshops,
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

exports.getTailorshopById = async (req, res) => {
  try {
    const tailorshopId = req.params.tailorshopId;

    const [results] = await sequelize.query(
      `SELECT t.id, t.shop_name, t.shop_description, t.shop_address
        FROM tailorshops t WHERE t.id = $tailorshopId;`,
      {
        bind: { tailorshopId: tailorshopId },
        type: QueryTypes.SELECT,
      }
    );

    if (!results || results.length == 0) {
      throw new NotFoundError("That tailorshop does not exists");
    }

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getTailorshopByCity = async (req, res) => {
  try {
    const city = req.params.city;
    const [results] = await sequelize.query(
      `SELECT c.city_name, t.id, t.shop_name, t.shop_description, t.shop_address 
      FROM tailorshops t 
      LEFT JOIN cities c ON t.fk_city_id = c.id 
      WHERE UPPER(c.city_name) = UPPER($city)
      ;`,
      {
        bind: { city: city },
      }
    );

    if (!results || results.length == 0) {
      throw new NotFoundError("That city does not exists.");
    }

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.createNewTailorshop = async (req, res) => {
  try {
    const { shop_name, shop_description, shop_address, city } = req.body;

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

    const [cityResults] = await sequelize.query(
      `SELECT * FROM cities c  
    WHERE UPPER(c.city_name) = UPPER($city);`,
      {
        bind: { city: city },
      }
    );
    if (cityResults.length === 0) {
      throw new NotFoundError("That city does not exists.");
    }

    const [newTailorshopId] = await sequelize.query(
      `INSERT INTO tailorshops (fk_user_id, fk_city_id, shop_name, shop_description, shop_address) VALUES ($tailorshopUser, $tailorshopCity, $tailorshopName, $tailorshopDescription, $tailorshopAddress);`,
      {
        bind: {
          tailorshopUser: userResults[0].id,
          tailorshopCity: cityResults[0].id,
          tailorshopName: shop_name,
          tailorshopDescription: shop_description,
          tailorshopAddress: shop_address,
        },
        type: QueryTypes.INSERT,
      }
    );

    return res
      .setHeader(
        "Location",
        `${req.protocol}://${req.headers.host}/api/v1/tailorshops/${newTailorshopId}`
      )
      .sendStatus(201);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateTailorshopById = async (req, res) => {
  try {
    const tailorshopId = req.params.tailorshopId;

    const { shop_name, shop_description, shop_address, city } = req.body;

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
    WHERE t.id = $id;`,
      {
        bind: { id: tailorshopId },
      }
    ) 

    if(tailorshopResult.length ===0) {
      throw new NotFoundError("That tailorshop does not exist!")
    }

    if (
      !userResults[0].is_admin &&
      userResults[0].id !== tailorshopResult[0].fk_user_id
    ) {
      throw new UnauthorizedError(
        "You are not allowed to update this tailorshop"
      );
    } 

    const [cityResults] = await sequelize.query(
      `SELECT * FROM cities c  
    WHERE UPPER(c.city_name) = UPPER($city);`,
      {
        bind: { city: city },
      }
    );

    if (cityResults.length === 0) {
      throw new NotFoundError("That city does not exists.");
    } else {

    const [updatedTailorshop] = await sequelize.query(
      `UPDATE tailorshops
  SET shop_name = $tailorshopName, shop_description = $tailorshopDescription, shop_address = $tailorshopAddress, fk_user_id = $tailorshopUser, fk_city_id = $tailorshopCity
  WHERE id = $tailorshopId
  RETURNING id, shop_name, shop_description, shop_address, fk_city_id`,
      {
        bind: {
          tailorshopUser: userResults[0].id,
          tailorshopCity: cityResults[0].id,
          tailorshopName: shop_name,
          tailorshopDescription: shop_description,
          tailorshopAddress: shop_address,
          tailorshopId: tailorshopId,
        },
      }
    );
    return res.json(updatedTailorshop[0]);
  }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteTailorshopById = async (req, res) => {
  try {
    const tailorshopId = req.params.tailorshopId;

    const [userResults] = await sequelize.query(
      `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user);`,
      {
        bind: { user: req.users.user_name },
      }
    );

    const [tailorshopResult] = await sequelize.query(
      `SELECT * FROM tailorshops t  
    WHERE t.id = $id;`,
      {
        bind: { id: tailorshopId },
      }
    );

    if (
      !userResults[0].is_admin &&
      userResults[0].id !== tailorshopResult[0].fk_user_id
    ) {
      throw new UnauthorizedError(
        "You are not allowed to delete this tailorshop"
      );
    } else {

    await sequelize.query(
      `DELETE FROM reviews WHERE fk_tailorshop_id = $tailorshopId ;`,
      {
        bind: { tailorshopId: tailorshopId },
        type: QueryTypes.DELETE,
      }
    );

    await sequelize.query(`DELETE FROM tailorshops WHERE id = $tailorshopId;`, {
      bind: { tailorshopId: tailorshopId },
      type: QueryTypes.DELETE,
    });
 
    return res.sendStatus(204); 
  }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
