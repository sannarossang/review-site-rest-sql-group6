const { Sequelize } = require('sequelize')
const path = require('path')

const sequelize = new Sequelize('todoDb', '', '', {
	dialect: 'sqlite',
	storage: path.join(__dirname, 'todoDb.sqlite'),
})

module.exports = { sequelize }
