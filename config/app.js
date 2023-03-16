require('dotenv').config();

if (process.env.MODE === 'prod') {
    module.exports = {
        app: {
            environment: "prod",
            database_uri: "mongodb://localhost:27017/expressjs-blog-app-db-sample-prod-1",
        }
    };
} else {
    module.exports = {
        app: {
            environment: "dev",
            database_uri: "mongodb://localhost:27017/expressjs-blog-app-db-sample-1",
        }
    };
}
