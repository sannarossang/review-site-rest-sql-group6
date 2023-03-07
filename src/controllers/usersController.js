// const { userRoles } = require("../constants/users");
const { NotFoundError, UnauthorizedError } = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");


exports.getAllUsers = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 5);
    const offset = Number(req.query.offset || 0);

    if (req.users.is_admin) {
      const [users] = await sequelize.query(
        "SELECT u.id, u.user_name, u.user_email FROM users u ORDER BY user_name LIMIT $limit OFFSET $offset;",
        {
          bind: {
            limit: limit,
            offset: offset,
          },
        }
      );

      if (users.length === 0) throw new NotFoundError("No users to display");

      return res.json(users);
    } else {
      throw new UnauthorizedError(
        "You are not authorized to perferm this action"
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.getUserById = async (req, res) => {
  try {
   const [user] = await sequelize.query(`SELECT u.id, u.user_name, u.user_email, u.is_admin FROM users u WHERE u.id = $userId;`, 
    {
      bind: {
        userId: req.params.userId,
      }

    })

    if(user.length === 0) {
      throw new NotFoundError("That user does not exist.");
    } else {
       return res.json(user);

    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { user_name, user_email, user_password } = req.body;

    const salt = await bcrypt.genSalt(10);

    console.log(user_password, salt)

    const hashedpass = await bcrypt.hash(user_password, salt);

    const [user] = await sequelize.query(
      `SELECT * FROM users u
      WHERE u.id = $userId;`,
      {
        bind: { userId: req.users.id },
      }
    );

    if (!user) throw new NotFoundError("That user does not exist");

    if(userId != req.users.id && !req.users.is_admin) {

      throw new UnauthorizedError("Unauthorized Access");

    } else {

      const [updatedUser] = await sequelize.query(
        `UPDATE users SET user_name = $user_name, user_email = $user_email, user_password = $user_password WHERE id= $userId RETURNING id, user_name, user_email, is_admin`,
        {
          bind: {
            userId: userId,
            user_name: user_name,
            user_email: user_email,
            user_password: hashedpass,
          },
        }
      );
      console.log(updatedUser);
      return res.json(updatedUser);
    } } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (userId != req.users?.id && !req.users.is_admin) {

      throw new UnauthorizedError("Unauthorized Access");

    }

    const [tailorshopCount] = await sequelize.query(
      `SELECT COUNT(*) AS tailorshopCount FROM tailorshops t WHERE t.fk_user_id = $userId;`,
      {
        bind: { userId: userId },
      }
    );

    if (tailorshopCount[0].tailorshopCount > 0) {
      throw new UnauthorizedError(
        "You are owner of tailorshops and need to delete your shops before deleting your account"
      );
    } else {

      await sequelize.query(`DELETE FROM reviews WHERE fk_user_id = $userId;`, {
        bind: { userId: userId },
      });

      await sequelize.query("DELETE FROM users WHERE id = $userId", {
        bind: { userId: userId },
      });

      console.log("User deleted successfully!");

    }
    return res.sendStatus(204);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
