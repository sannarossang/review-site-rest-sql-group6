const { body } = require('express-validator')

exports.registerSchema = [
	body('user_name')
		.not()
		.isEmpty()
		.withMessage('You must provide a valid user name')
		.isLength({ min: 2 }),
	body('user_email').isEmail().withMessage('You must provide a valid email address'),
	body('user_password')
		.not()
		.isEmpty()
		.isLength({ min: 6 })
		.withMessage('You must provide a password that is at least 6 characters long'),
]

exports.loginSchema = [
	body('user_email').isEmail().withMessage('You must provide a valid email address'),
	body('user_password').not().isEmpty().withMessage('You must provide a password'),
]
