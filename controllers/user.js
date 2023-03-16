const _                 = require('lodash');
const mongoose          = require('mongoose');
const EventEmitter      = require('events').EventEmitter;

const UserLayer         = require('../dal/user');



exports.getUsersProfile = (req, res, next) => {
    UserLayer.getCollection({}, req.query, (err, users) => {
        if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while getting collection of users" })
        return res.status(200).json(users);
    })
}


exports.getUserProfile = (req, res, next) => {
    UserLayer.get({ _id: req.params?.id }, (err, userProfile) => {
        if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while getting a specific user profile" })
        if(!userProfile?._id) return res.status(404).json({ message: "No user found with this id" });
        return res.status(200).json(userProfile);
    })
}

exports.updateProfile = (req, res, next) => {

	let body = req.value.body;
    let taskflow = new EventEmitter();

    taskflow.on("checkExistenceAndAuthorization", () => {
        UserLayer.get({ _id: req.params.id }, (err, user) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating user" })
            if(!user?._id) return res.status(404).json({ message: "User not found" })
            console.log(user._id, req._user?._id);
            if(String(user._id) !== String(req._user?._id)) return res.status(403).json({ message: "You are not authorized to update a profile which doesn't belong to you." })
            taskflow.emit('update', user._id)
        })
    })

    taskflow.on('update', (userId) => {
        UserLayer.update({ _id: userId }, body, {}, (err, updatedUser) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating user profile" });
            return res.status(201).json(updatedUser);
        }) 
    })

    if(mongoose.isObjectIdOrHexString(req.params?.id)) taskflow.emit('checkExistenceAndAuthorization')
    else res.status(400).json({ message: "Invalid user id given" })
	
}


exports.updateProfileImage =  async (req, res, next) => {

    let taskflow = new EventEmitter();

     // Check if referenced user exist
     taskflow.on('checkIfUserExist', async () => {
        UserLayer.get({  _id: req.params?.id }, (err, user) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "An error occured while uploading profile image" });
            if(user && user._id) taskflow.emit('uploadProfilePicture', user._id);
            else return res.status(404).json({ message: "The referenced user does not exist" });
        })
    })

    taskflow.on('uploadProfilePicture', async (id) => {
        let updates = {
            profile_image: req.file ? '/public/profile/images/' + req.file?.filename : null
        }

        if(updates.profile_image == null) return res.status(400).json({ message: "No Image Given" });

        await UserLayer.update({ _id: mongoose.Types.ObjectId(id) }, updates, {}, (err, updatedProfile) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "An error occured while uploading profile image" });
            res.json({ updatedProfile });
        });
    })
   
    if(mongoose.isObjectIdOrHexString(req.params?.id)) taskflow.emit('checkIfUserExist')
    else res.status(400).json({ message: "Invalid user id given" })
}



exports.removeUser = (req, res, next) => {

    let taskflow = new EventEmitter();

    taskflow.on("checkExistenceAndAuthorization", () => {
        UserLayer.get({ _id: req.params.id }, (err, user) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating user" })
            if(!user?._id) return res.status(404).json({ message: "User not found" })
            if(String(user._id) !== String(req._user?._id)) return res.status(403).json({ message: "You are not authorized to remove a user which doesn't belong to you." })
            taskflow.emit('remove', user._id)
        })
    })

    taskflow.on('remove', (userId) => {
        UserLayer.remove({ _id: userId }, (err, removedUser) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating user profile" });
            return res.status(201).json({ "success": true, removedUser });
        }) 
    })

    if(mongoose.isObjectIdOrHexString(req.params?.id)) taskflow.emit('checkExistenceAndAuthorization')
    else res.status(400).json({ message: "Invalid user id given" })	
}
