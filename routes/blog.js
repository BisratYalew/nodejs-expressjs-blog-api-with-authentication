const express = require('express');
const router = express.Router();

const BlogController        = require('../controllers/blog');
const authenticate          = require('../middlewares/authenticate');

const { validateBody, validateQuery, schemas } = require('../middlewares/validator');
const createBlogSchemaValidator                = validateBody(schemas.blogPostSchema);
const updateBlogSchemaValidator                = validateBody(schemas.updateBlogPostSchema);

router.post('/',           authenticate(),           createBlogSchemaValidator,        BlogController.createBlog);
router.get('/',            BlogController.getBlogs);
router.get('/:id',         BlogController.getBlog);
router.put('/:id',         authenticate(),           updateBlogSchemaValidator,        BlogController.updateBlog);
router.delete('/:id',      authenticate(),           BlogController.removeBlog);


module.exports = router;