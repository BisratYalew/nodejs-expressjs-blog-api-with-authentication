const express       = require('express');
const bodyParser    = require('body-parser');
const path          = require('path');

const router        = require('./routes');
const app           = express();

/* import required paramaters for database connection */
const config_app = require('./config/app.js');
const { databaseInitializer } = require('./libraries/database.js');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

/* connect to database */
databaseInitializer(config_app.app?.database_uri);


router(app);

/* Exclude public directory */
app.use('/public', express.static(path.join(__dirname, '/public')))


/* listen for requests */
app.listen(3000, ()=> {
    console.log('Application running on port 3000');
})

module.exports = app;