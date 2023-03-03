const { QueryError, QueryTypes } = require("sequelize");
const { sequelize } = require("../database/config");
const { NotFoundError, UnauthorizedError } = require("../utils/errors");

exports.getAllTailorshops = async (req, res) => {
  const [results] = await sequelize.query(
    `SELECT id, shop_name, shop_description, shop_address FROM tailorshops`
  );
  return res.json(results);
};

exports.getTailorshopById = async (req, res) => {
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
};

exports.getTailorshopByCity = async (req, res) => {
  const city = req.params.city;
  const [results] = await sequelize.query(
    `SELECT c.city_name, t.id, t.shop_name, t.shop_description, t.shop_address 
    FROM tailorshops t 
    LEFT JOIN cities c ON t.fk_city_id = c.id 
    WHERE UPPER(c.city_name) = UPPER($city);`,
    {
      bind: { city: city },
    }
  );

  if (!results || results.length == 0) {
    throw new NotFoundError("That city does not exists.");
  }

  return res.json(results);
};

exports.createNewTailorshop = async (req, res) => {
  const { shop_name, shop_description, shop_address, city } = req.body;

  const [userResults] = await sequelize.query(
    `SELECT * FROM users u
    WHERE UPPER(u.user_name) = UPPER($user);`, //hämtar bara om filtrering stämmer, dvs att det som skrivit i bodyn finns som username i tabellen
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
};

exports.updateTailorshopById = async (req, res) => {
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

  const [tailorshopResult] = await sequelize.query(
    `SELECT * FROM tailorshops t  
    WHERE t.id = $id;`,
    {
      bind: { id: tailorshopId },
    }
  );

  if (userResults[0].id !== tailorshopResult[0].fk_user_id) {
    throw new UnauthorizedError(
      "You are not allowed to update this tailorshop"
    );
  }

  const [updatedTailorshop] = await sequelize.query(
    `UPDATE tailorshops
  SET shop_name = $tailorshopName, shop_description = $tailorshopDescription, shop_address = $tailorshopAddress, fk_user_id = $tailorshopUser, fk_city_id = $tailorshopCity
  WHERE id = $tailorshopId
  RETURNING *`,
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
};

exports.deleteTailorshopById = async (req, res) => {
  const tailorshopId = req.params.tailorshopId;
  //måste hantera användaren måste vara admin eller bara kan ta bort sina

  await sequelize.query(`DELETE FROM tailorshops WHERE id = $tailorshopId;`, {
    bind: { tailorshopId: tailorshopId },
    type: QueryTypes.DELETE,
  });
  return res.sendStatus(204);
};
