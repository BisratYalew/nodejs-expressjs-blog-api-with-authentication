const express       = require('express');
const bodyParser    = require('body-parser');
const path          = require('path');
const rateLimit     = require('express-rate-limit');

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

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

/* Exclude public directory */
app.use('/public', express.static(path.join(__dirname, '/public')))


// Apply the rate limiting middleware to all requests
app.use(limiter)

/* listen for requests */
app.listen(3000, ()=> {
    console.log('Application running on port 3000');
})

module.exports = app;
