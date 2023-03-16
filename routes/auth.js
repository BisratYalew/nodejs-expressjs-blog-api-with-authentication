const express               = require('express');
const router                = express.Router();

const AuthController        = require('../controllers/auth');
const authenticate          = require('../middlewares/authenticate');

const { validateBody, validateQuery, schemas } = require('../middlewares/validator');
const signupSchemaValidator = validateBody(schemas.signupSchema);
const loginSchemaValidator  = validateBody(schemas.loginSchema);


router.post('/register',    signupSchemaValidator,  AuthController.signup);
router.post('/login',       loginSchemaValidator,   AuthController.signin);
router.put('/logout',       authenticate(),         AuthController.logoutUser);

module.exports = router;