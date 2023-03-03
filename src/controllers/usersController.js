// const { userRoles } = require("../constants/users");
const { NotFoundError, UnauthorizedError } = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  const [users, metadata] = await sequelize.query(
    "SELECT id, user_email FROM users"
  );
  return res.json(users);
};
exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  const [users, metadata] = await sequelize.query(
    "SELECT u.id, u.user_name, u.user_email FROM users u WHERE u.id = $userId",
    {
      bind: { userId: userId },
      type: QueryTypes.SELECT,
    }
  );

  if (!users) throw new NotFoundError("That user does not exist");

  return res.json(users);
};

exports.updateUserById = async (req, res) => {
    const userId = req.params.userId;
    const {
        user_name,
        user_email,
        user_password,
        is_admin
    } = req.body;
  const userId = req.params.userId;
  const { user_name, user_email, user_password, user_role, is_admin } =
    req.body;

  if (!userId) throw new NotFoundError("That user does not exist");

    const [updatedUser] = await sequelize.query(
        `UPDATE users SET user_name = $user_name, user_email = $user_email, user_password = $user_password, is_admin = $is_admin WHERE id= $userId RETURNING *`,
        {
            bind: {
                userId: userId,
                user_name: user_name,
                user_email: user_email,
                user_password: user_password,
                is_admin: is_admin
            },

        }
    );

  console.log(updatedUser);
  return res.json(updatedUser);
};

exports.deleteUserById = async (req, res) => {
    const userId = req.params.userId

  const [tailorshopCount] = await sequelize.query(
    `SELECT COUNT(*) AS tailorshopCount FROM tailorshops t WHERE t.fk_user_id = $userId;`,
    {
      bind: { userId: userId },
    }
  );

  console.log(tailorshopCount);

        if (tailorshopCount[0].tailorshopCount > 0) {
/*
            await sequelize.query(
                `DELETE FROM tailorshops WHERE fk_user_id = $userId;`, 
            {
                bind: { userId: userId },
                //type: QueryTypes.DELETE,
            }) */

            throw new UnauthorizedError("You are owner of tailorshops and need to delete your shops before deleting your account")
        } else {
            await sequelize.query(
                `DELETE FROM reviews WHERE fk_user_id = $userId;`,
                {
                    bind: { userId: userId}
                }
                );

                // if (userId != req.users?.userId || !req.users.is_admin) {
                //     throw new UnauthorizedError('Unauthorized Access')
                // }  else {
                    await sequelize.query('DELETE FROM users WHERE id = $userId', {
                        bind: { userId: userId}
                    }) 
                    console.log("User deleted successfully!")
             //   }    
        }

  return res.sendStatus(204);
};
