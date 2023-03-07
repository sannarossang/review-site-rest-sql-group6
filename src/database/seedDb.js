const { sequelize } = require("./config");
const bcrypt = require("bcrypt");

const seedTailorshopsDb = async () => {
  try {
    await sequelize.query(`DROP TABLE IF EXISTS reviews;`);
    await sequelize.query(`DROP TABLE IF EXISTS tailorshops;`);
    await sequelize.query(`DROP TABLE IF EXISTS cities;`);
    await sequelize.query(`DROP TABLE IF EXISTS users;`);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_password TEXT NOT NULL,
            is_admin BOOLEAN CHECK (is_admin IN (0,1)) 
        );`);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_name TEXT NOT NULL
    );`);

    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS tailorshops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_name TEXT NOT NULL,
        shop_description TEXT NOT NULL,
        shop_address TEXT NOT NULL,
        fk_user_id INTEGER NOT NULL,
        fk_city_id INTEGER NOT NULL,
        FOREIGN KEY(fk_user_id) REFERENCES users(id),
        FOREIGN KEY(fk_city_id) REFERENCES cities(id)
    );`);

    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_text TEXT NOT NULL,
            review_score INTEGER,
            fk_user_id INTEGER NOT NULL,
            fk_tailorshop_id INTEGER NOT NULL,
            FOREIGN KEY(fk_user_id) REFERENCES users(id),
            FOREIGN KEY(fk_tailorshop_id) REFERENCES tailorshops(id)
        );`);

    const salt = await bcrypt.genSalt(10);
    const firstUserPassword = "firstuser123";
    const hashedpass1 = await bcrypt.hash(firstUserPassword, salt);

    const secondUserPassword = "seconduser123";
    const hashedpass2 = await bcrypt.hash(secondUserPassword, salt);

    const thirdUserPassword = "thirduser123";
    const hashedpass3 = await bcrypt.hash(thirdUserPassword, salt);

    const adminPassword = "admin123";
    const hashedpass4 = await bcrypt.hash(adminPassword, salt);

    let usersInsertQuery = `INSERT INTO users(user_name, user_email, user_password, is_admin) VALUES 
        ("firstuser", "firstuser@gmail.com", "${hashedpass1}" , 0), 
        ("seconduser", "seconduser@gmail.com", "${hashedpass2}", 0),
        ("thirduser", "thirduser@gmail.com", "${hashedpass3}", 0),
        ("adminuser", "adminuser@gmail.com", "${hashedpass4}", 1)`;

    await sequelize.query(usersInsertQuery);

    let citiesInsertQuery = `INSERT INTO cities(city_name) VALUES ("Stockholm"), ("Gothenburg"), ("Malmö")`;

    await sequelize.query(citiesInsertQuery);

    let tailorshopsInsertQuery = `INSERT INTO tailorshops (shop_name, shop_description, shop_address, fk_user_id, fk_city_id) VALUES 
    ("first tailor", "first tailor description lorem ipsum", "first tailor street 1", (SELECT id FROM users WHERE user_email = 'firstuser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Stockholm')), 
    ("second tailor", "second tailor description lorem ipsum", "second tailor street 2", (SELECT id FROM users WHERE user_email = 'seconduser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Stockholm')),
    ("third tailor", "third tailor description lorem ipsum", "third tailor street 3", (SELECT id FROM users WHERE user_email = 'thirduser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Stockholm')),
    ("fourth tailor", "fourth tailor description lorem ipsum", "fourth tailor street 4", (SELECT id FROM users WHERE user_email = 'adminuser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Gothenburg')),
    ("fifth tailor", "fifth tailor description lorem ipsum", "fifth tailor street 5", (SELECT id FROM users WHERE user_email = 'firstuser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Gothenburg')),
    ("sixth tailor", "sixth tailor description lorem ipsum", "sixth tailor street 6", (SELECT id FROM users WHERE user_email = 'seconduser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Gothenburg')),
    ("seventh tailor", "seventh tailor description lorem ipsum", "seventh tailor street 7", (SELECT id FROM users WHERE user_email = 'thirduser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Gothenburg')),
    ("eighth tailor", "eighth tailor description lorem ipsum", "eighth tailor street 8", (SELECT id FROM users WHERE user_email = 'adminuser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Malmö')),
    ("ninth tailor", "ninth tailor description lorem ipsum", "ninth tailor street 9", (SELECT id FROM users WHERE user_email = 'firstuser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Malmö')),
    ("tenth tailor", "tenth tailor description lorem ipsum", "tenth tailor street 10", (SELECT id FROM users WHERE user_email = 'seconduser@gmail.com'), (SELECT id FROM cities WHERE city_name = 'Malmö'))
    `;

    await sequelize.query(tailorshopsInsertQuery, {
      bind: tailorshopsInsertQuery,
    });

    const [tailorshopsRes, metadata] = await sequelize.query(
      "SELECT shop_name, id FROM tailorshops"
    );

    let reviewsInsertQuery = `INSERT INTO reviews(review_text, review_score, fk_user_id, fk_tailorshop_id) VALUES 
    ("Review 1 lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", 1, (SELECT id FROM users WHERE user_name = 'firstuser'), (SELECT id FROM tailorshops WHERE shop_name = 'first tailor')),
    ("Review 2 ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?", 2, (SELECT id FROM users WHERE user_name = 'seconduser'), (SELECT id FROM tailorshops WHERE shop_name = 'second tailor')) ,
    ("Review 3 emo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. ", 3, (SELECT id FROM users WHERE user_name = 'thirduser'), (SELECT id FROM tailorshops WHERE shop_name = 'third tailor')),
    ("Review 4 Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis", 4, (SELECT id FROM users WHERE user_name = 'adminuser'), (SELECT id FROM tailorshops WHERE shop_name = 'fourth tailor')),
    ("Review 5 ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ", 5, (SELECT id FROM users WHERE user_name = 'firstuser'), (SELECT id FROM tailorshops WHERE shop_name = 'fifth tailor')),
    ("Review 6 Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit", 1, (SELECT id FROM users WHERE user_name = 'seconduser'), (SELECT id FROM tailorshops WHERE shop_name = 'sixth tailor')),
    ("Review 7 Numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem", 2, (SELECT id FROM users WHERE user_name = 'thirduser'), (SELECT id FROM tailorshops WHERE shop_name = 'seventh tailor')),
    ("Review 8 Voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo.", 3, (SELECT id FROM users WHERE user_name = 'adminuser'), (SELECT id FROM tailorshops WHERE shop_name = 'eighth tailor')),
    ("Review 9 Numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.", 4, (SELECT id FROM users WHERE user_name = 'firstuser'), (SELECT id FROM tailorshops WHERE shop_name = 'ninth tailor')),
    ("Review 10 Voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi.", 5, (SELECT id FROM users WHERE user_name = 'seconduser'), (SELECT id FROM tailorshops WHERE shop_name = 'tenth tailor'))
    `;

    await sequelize.query(reviewsInsertQuery, {
      bind: reviewsInsertQuery,
    });
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

seedTailorshopsDb();
