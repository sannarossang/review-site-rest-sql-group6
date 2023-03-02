const { userRoles } = require("../constants/users");
const { NotFoundError, UnauthorizedError } = require('../utils/errors')
const { sequelize } = require('../database/config')
const { QueryTypes } = require('sequelize')


exports.getAllUsers = async (req, res) => {
    const [users, metadata] = await sequelize.query('SELECT id, user_email FROM users')
    return res.json(users)
};
exports.getUserById = async (req, res) => {
    const userId = req.params.userId

    const [users, metadata] = await sequelize.query('SELECT u.id, u.user_name, u.user_email FROM users u WHERE u.id = $userId', {
		bind: { userId: userId},
		type: QueryTypes.SELECT,
	})

    if (!users) throw new NotFoundError('That user does not exist')

    return res.json(users)
};
//exports.createNewUser = async (req, res) => {};
exports.updateUserById = async (req, res) => {
    const userId = req.params.userId;
    const {
        user_name,
        user_email,
        user_password,
        user_role,
        is_admin
    } = req.body;

    if(!userId) throw new NotFoundError('That user does not exist');

    const [updatedUser] = await sequelize.query(
        `UPDATE users SET user_name = $user_name, user_email = $user_email, user_password = $user_password, user_role = $user_role, is_admin = $is_admin WHERE id= ${userId} RETURNING *`,
        {
            bind: {
                user_name: user_name,
                user_email: user_email,
                user_password: user_password,
                user_role: user_role,
                is_admin: is_admin
            },
            //type: QueryTypes.UPDATE,
        }
    );

    console.log(updatedUser)
    return res.json(updatedUser)

};
exports.deleteUserById = async (req, res) => {
    const userId = req.params.userId

  /* if (userId != req.users?.userId && req.users.user_role !== userRoles.ADMIN) {
		throw new UnauthorizedError('Unauthorized Access')
	}  */ 

    console.log("1")


    await sequelize.query(`DELETE FROM tailorshops WHERE fk_user_id = $userId;`, {
		bind: { userId: userId },
		type: QueryTypes.DELETE,
	})

    console.log("2")
    await sequelize.query(`DELETE FROM reviews WHERE fk_user_id = $userId;`, {
		bind: { userId: userId },
		type: QueryTypes.DELETE,
	})
    console.log("3") 

    const [results, metadata] =  await sequelize.query('DELETE FROM users WHERE id = $userId', {
		bind: { userId: userId},
        type: QueryTypes.DELETE,
	}) 


   

    console.log("4")
    if (!results || !results[0]) throw new NotFoundError('That user does not exist')

    console.log("5")

    return res.sendStatus(204)
};
