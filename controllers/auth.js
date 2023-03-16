const _                 = require('lodash');
const mongoose          = require('mongoose');
const EventEmitter      = require('events').EventEmitter;
const TokenLayer        = require('../dal/token');
const moment            = require('moment');

const User              = require('../models/user');

const UserLayer         = require('../dal/user');

const rbg               = require('../libraries/rbg');



exports.signup = (req, res, next) => {

    let taskflow = new EventEmitter();
    const { email, password, firstname, lastname, profile_image } = req.value.body;


    taskflow.on('exists', async () => {      

        // Check if there is a user with the same email
        const userFound = await User.findOne({ email });

        if(userFound) return res.status(400).json({ message: "User with this email has already registered" });
        else taskflow.emit('createUser')

    })

    taskflow.on('createUser', async () => {

        // Create a new user
        const userData = req.value.body;  // req.value.body holds validated data.

        await UserLayer.create(userData, (err, user) => {
            if(err) return res.status(500).json({ message: process.env?.mode == 'dev' ? err.message : "An error occured while signing up a user" });
            if(user) taskflow.emit('generateToken', user);
        })

    });


    taskflow.on('generateToken', (newUser) => {
        let token_generated = rbg(50).toString('base64');
        let refreshToken    = rbg(50).toString('base64');
        // Create a New Token
        TokenLayer.create({
            value: token_generated,
            user: newUser._id,
            role: "userLogin",
            revoked: false,    

        }, (err, token) => {
            if(err) return res.status(500).json({ message: process.env?.mode == 'dev' ? err.message : "An error occured while signing up a user" })    
            taskflow.emit('respond', token, newUser);
        });
    });


    taskflow.on('respond', (token, new_user) => {
        var token = _.pick(token, 'value');
        return res.status(201).json({ token: { accessToken: token.value }, new_user });
    });


    taskflow.emit('exists');     
   
}




exports.signin = async(req, res, next) => {

    let taskflow = new EventEmitter();

    taskflow.on('verify_credential', () => {
        try {
            let { email, password } = req.value.body;         

            User.findOne({ email }, (err, user) => {    
                
                if(err) return res.status(500).json({ type: "error", 
                                                      message: process.env?.MODE == 'dev' ? 
                                                          err.message : "An error occured while signing in user" 
                                                    })
                if (!user) {
                    return res.status(401).json({   
                        status: 401, 
                        type: "INVALID_AUTHENTICATION_CREDENTIALS",
                        message: 'You have given invalid authentication credentials' 
                    });
                }
       
                user.verifyPassword(password, (err, isMatch) => {
                    if(err) {
                        res.status(500).json({ message: err.message });
                    }
                    if (!isMatch) {
                        console.log("Password do not match", password);
                        return res.status(401).json({
                                status: 401, 
                                type: "error",
                                message: 'Incorrect password.' 
                            });
                    } else {
                        taskflow.emit('signToken', user);
                    }
                }); 
            });               
    
        } catch (error) {
            return res.status(500).json({ message: process.env?.mode == 'dev' ? err.message : "An error occured while logging in a user" });

        }    
    })


    taskflow.on('signToken', (user) => {
        TokenLayer.get({ user: mongoose.Types.ObjectId(user._id), role: "userLogin" }, (err, token) => {
            if(err) return res.status(500).json(err.message);
    
            //var tokenValue = crypto.randomBytes(config.TOKEN_LENGTH).toString('base64');
            var token_generated = rbg(100).toString('base64');
            var refreshToken    = rbg(15).toString('base64');
            
            if(token._id) {
                TokenLayer.update({ _id: token._id }, {
                    value: token_generated,
                    revoked: false,               
                }, (err, token) => {
                    if(err) return res.status(500).json({ message: process.env?.mode == 'dev' ? err.message : "An error occured while logging in a user" });
                    taskflow.emit('respond', token, user);
                })
   
            } else {
                // Create a New Token
                TokenLayer.create({
                    value: token_generated,
                    user: user._id,
                    role: "user",
                    revoked: false,    
                }, (err, token) => {
                    if(err) return res.status(500).json({ message: process.env?.mode == 'dev' ? err.message : "An error occured while logging in a user" });
                    taskflow.emit('respond', token, user);
                })
            }
        });
    });
        
    taskflow.on('respond', async (token, user) => {

        // delete user.password;
        user.password = null;

        res.status(200).json({
            token: { accessToken: token.value }, 
            user          
        });
    });

    taskflow.emit('verify_credential'); 
}



/**
 * Logout User
 *
 * @desc Logout User
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware Dispatcher
 */
exports.logoutUser = (req, res, next) => {    

	let user = req._user;

	TokenLayer.update({ user: user._id },{ revoked: true,	value: '' }, (err, token) => {
        if(err) return res.status(500).json({ message: process.env?.mode == 'dev' ? err.message : "An error occured while logging out a user" });
		if(!token._id) return res.status(404).json({ message: "Token not found" })
		res.status(201).json({ logged_out: true })
	})
}
