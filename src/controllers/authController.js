const { UnauthenticatedError } = require("../utils/errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");

exports.register = async (req, res) => {
  const { user_name, user_password, user_email, is_admin} = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(user_password, salt);

  const [results, metadata] = await sequelize.query(
    "SELECT id FROM users LIMIT 1"
  );

  if (!results || results.length < 1) {
    await sequelize.query(
			'INSERT INTO users (user_name, user_email, user_password, is_admin) VALUES ($user_name, $user_email, $user_password, TRUE)', 
			{
				bind: {
          user_name: user_name,
					user_password: hashedpassword,
					user_email: user_email
				}
			}
		)
  } else {
      await sequelize.query(
        'INSERT INTO users (user_name, user_email, user_password, is_admin) VALUES ($user_name, $user_email, $user_password, FALSE)', 
        {
          bind: {
            user_name: user_name,
            user_password: hashedpassword,
            user_email: user_email
          },
        }
      )  
    
  }

  return res.status(201).json({
    message: "Registration succeeded. Please log in.",
  });
};

exports.login = async (req, res) => {
  const { user_email, user_password: canditatePassword } = req.body;
  
  const [users, metadata] = await sequelize.query(
		'SELECT * FROM users WHERE  user_email = $user_email LIMIT 1;', {
		bind: { user_email },
		type: QueryTypes.SELECT
	})

  if (!users) throw new UnauthenticatedError("Invalid Credentials");

  const isPasswordCorrect = await bcrypt.compare(
    canditatePassword,
    users.user_password
  );
  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid Credentials");

  const jwtPayload = {
    id: users.id,
    user_name: users.user_name,
    user_email: users.user_email,
    is_admin: users.is_admin === 1 ,
  };

  const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.json({ token: jwtToken, users: jwtPayload });
};
