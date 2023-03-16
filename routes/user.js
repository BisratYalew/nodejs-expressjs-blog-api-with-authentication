const express = require('express');
const multer  = require('multer');

const router = express.Router();

const UserController        = require('../controllers/user');
const BlogController        = require('../controllers/blog');
const authenticate          = require('../middlewares/authenticate');
const rbg = require('../libraries/rbg');

const { validateBody, validateQuery, schemas } = require('../middlewares/validator');
const updateProfileSchemaValidator = validateBody(schemas.userUpdateSchema);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, require('path').join(__dirname, '../public/profile/images'));
    },
    filename: function (req, file, cb) {
      cb(null, 'nodejsblog-api-' + rbg(23) + '.jpg');
    }
}); 
  
const upload = multer({ storage: storage });



router.get('/',                    UserController.getUsersProfile);
router.get('/:id',                 UserController.getUserProfile);
router.put('/:id',                 authenticate(),         updateProfileSchemaValidator,      UserController.updateProfile);
router.put('/:id/profile-image',   authenticate(),         upload.single('profile-image'),    UserController.updateProfileImage);
router.delete('/:id',              authenticate(),         UserController.removeUser);
router.get('/:authorId/blogs',                             BlogController.getAuthorBlogs);


module.exports = router;