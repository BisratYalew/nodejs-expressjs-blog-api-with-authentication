const Joi = require('joi');

module.exports = {
    
    validateBody: (schema) => {
        return(req, res, next)=> {
            const result = Joi.validate(req.body, schema);
            if(result.error){
                return res.status(400).json(result.error);
            }

            if(!req.value) {req.value = {};}
            req.value['body'] = result.value;
            next();
        }
    },

    validateQuery: (schema) => {
        return(req, res, next)=> {
            const result = Joi.validate(req.query, schema);
            if(result.error){
                return res.status(400).json(result.error);
            }

            if(!req.value) {req.value = {};}
            req.value['query'] = result.value;
            next();
        }
    },

    schemas:{        
        signupSchema: Joi.object().keys({
            email: Joi.string().email().required(),
            password : Joi.string().required(),
            firstname: Joi.string().required(),
            lastname: Joi.string().required(),
            profile_image: Joi.string(),
        }),        

        loginSchema: Joi.object().keys({
            email: Joi.string().email(),
            password : Joi.string().required()
        }).with('email', 'password'),


        userUpdateSchema: Joi.object().keys({
            firstname: Joi.string(),
            lastname: Joi.string(),
            profile_image: Joi.string(),
        }).min(1),

        blogPostSchema: Joi.object().keys({
            title: Joi.string().required(),
            content: Joi.string().required(),
            image: Joi.string(),
            tags: Joi.array().required()
        }),
        updateBlogPostSchema: Joi.object().keys({
            title: Joi.string(),
            content: Joi.string(),
            image: Joi.string(),
            tags: Joi.array()
        })

    }
}