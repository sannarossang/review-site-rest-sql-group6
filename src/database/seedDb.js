const {sequelize} = require('./config')
const {tailorshops} = require('../../data/tailorshops')
const {reviews} = require('../../data/reviews')
const { users} = require('../../data/users')
const {cities} = require('../../data/cities')

const seedTailorshopsDb = async ()=> {
    try {
        await sequelize.query(`DROP TABLE IF EXISTS users`)
        await sequelize.query(`DROP TABLE IF EXISTS tailorshops;`)
        await sequelize.query(`DROP TABLE IF EXISTS reviews;`)

        await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_password TEXT NOT NULL,
            user_role TEXT NOT NULL
        );`)

        // is_admin BOOLEAN CHECK (is_admin IN (0,1))

        await sequelize.query(`
        CREATE TABLE IF NOT EXISTS tailorshops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_name TEXT NOT NULL,
            shop_description TEXT NOT NULL,
            shop_address TEXT NOT NULL,
            fk_user_id INTEGER NOT NULL,
            FOREIGN KEY(fk_user_id) REFERENCES users(id)
        );`)

        await sequelize.query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_text TEXT NOT NULL,
            review_score INTEGER
        );`)

        await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_name TEXT NOT NULL
        );`)

    } catch (error) {
        console.error(error)
    }
}

seedTailorshopsDb()