const auth_route = require('./auth.js');
const user_route = require('./user.js');
const blog_route = require('./blog.js');

module.exports = (app) => {

    // Authentication route
    app.use('/api/v1/auth', auth_route);

    // Users Route
    app.use('/api/v1/users', user_route);

    // Blogs Route
    app.use('/api/v1/blogs', blog_route);
    
}