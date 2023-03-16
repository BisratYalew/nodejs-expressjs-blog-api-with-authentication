const unless   			= require('express-unless');
const TokenLayer 		= require('../dal/token');


module.exports = (opts) => {
	    
	let Authmiddleware = (req, res, next) => {
		// 1. Retrieve Authorization Header
		// 2. Validate Authorization Header
		// 3. Allow/Disallow "User"

		let authorization = req.get('Authorization');

		if(!authorization) {
			res.status(403);
			res.json({
				status: 403,
				type: "AUTHENTICATION_ERROR",
				message: "You can't authenticate"
			});
			return;
		}

		
		let authParts = authorization.split(' ');

		if(!['Bearer', 'blog-api'].includes(authParts[0]) || !authParts[1]) {
			res.status(403);
			res.json({
				status: 403,
				type: 'AUTHENTICATION_ERROR',
				message: 'Wrong Authentication Schema'
			});
			return;
		}


		TokenLayer.get({ value: authParts[1] }, (err, token) => {

			if(err){
				res.status(500);
				res.json({
					status: 500,
					type: 'AUTHENTICATION_ERROR',
					message: err.message
				})
				return;
			}			

			if(!token._id) {
				res.status(403);
				res.json({
					status: 403,
					type: 'AUTHENTICATION_ERROR',
					message: 'Wrong Authentication Credentials/Tokens'
				})
				return;

			}  else if(token.revoked) {
				res.status(401);
				res.json({
					status: 401,
					type: 'AUTHENTICATION_ERROR',
					message: 'Action Denied!!'
				})
				return;

			} else {

				if(token.user !== undefined) {
                    req.user = token.user;
                    req._user = token.user;                                        
				} else {
					res.json({ message: "User Profile Not Found on Token!" })
				}

				next();

			}
		})		
	};

	Authmiddleware.unless = unless;

	return Authmiddleware;
};