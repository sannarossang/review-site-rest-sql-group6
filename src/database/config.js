const { Sequelize } = require('sequelize')
const path = require('path')

const sequelize = new Sequelize('tailorshopDb', '', '', {
	dialect: 'sqlite',
	storage: path.join(__dirname, 'tailorshopDb.sqlite'),
})

module.exports = { sequelize }
