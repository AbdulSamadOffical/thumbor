
const knex = require("knex");

let db = knex({

  // debug: true,
  client: 'postgres',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'Welcome123',
    database: 'dastgyr_dev1',
    port: 5444,
    pool: {
      autostart: true,
      max: 10,
      min: 2,
      propagateCreateError: false,
    },
  },
 
});

db.raw('select 1+1 as result').catch(err => {
    console.log(err);
    process.exit(1);
  });

module.exports = db;


