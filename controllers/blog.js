const mongoose = require('mongoose');
const EventEmitter = require('events').EventEmitter;

// Imported data access layer for blog
const BlogLayer = require('../dal/blog');
const UserLayer = require('../dal/user');



/* Create a new blog post */
const createBlog = async (req, res) => {
    let blogData = { ...req.value.body, author: req._user?._id };
    BlogLayer.create(blogData,  (err, blog) => {
        if(err) return res.status(500).json({ type: "error", message: process.env.MODE == 'dev' ? err.message : "An error occured while creating blog" })
        return res.status(201).json(blog)
    });    
}


/* Get all blog posts */
const getBlogs = async (req, res, next) => {
    BlogLayer.getCollection({}, {}, (err, blogs) => {
        if(err) res.status(500).json({ 
            type: "error", 
            message: process.env?.mode == "dev" ? err.message : "Something went wrong please try again"
        })
        return res.status(200).json({ data: blogs });
    })  
}


/* Get a specific blog post */
const getBlog = async (req, res) => {
    let blogId = req.params?.id;

    if(mongoose.isObjectIdOrHexString(blogId) == false) return res.status(400).json({ message: "Invalid blog id given" })
        
    BlogLayer.get({ _id: blogId }, (err, blog) => {
        if(err) res.status(500).json({ 
            type: "error", 
            message: process.env?.MODE == "dev" ? err.message : "Something went wrong please try again"
        })
        if(!blog?._id) return res.status(404).json({ message: "Blog not found" });
        return res.status(200).json(blog);
    })

}


// Get a specific author blogs
const getAuthorBlogs = async (req, res, next) => {

    let taskflow = new EventEmitter;
    let authorId = req.params.authorId;

    // Check if the author exists
    // Get all blog posts by pagination

    taskflow.on('checkIfAuthorExist', () => {
        UserLayer.get({ _id: authorId }, (err, author) => {
            if(err) return res.status(500).json({ type: "error", message: process.env.MODE == 'dev' ? err.message : "An error occured while loading author's blogs"})
            if(!author?._id) return res.status(404).json({ message: "No author found with this id" })
            taskflow.emit('getBlogs', author._id);
        })
    })

    taskflow.on("getBlogs", (authorId) => {
        BlogLayer.getCollection({ author: authorId }, {}, (err, blogs) => {
            if(err) return res.status(500).json({ type: "error", message: process.env.MODE == 'dev' ? err.message : "An error occured while loading author's blogs"})
            return res.status(200).json(blogs)
        })
    })

    if(mongoose.isObjectIdOrHexString(req.params?.authorId)) taskflow.emit('checkIfAuthorExist')
    else res.status(400).json({ message: "Invalid author id given" })   
}

/**
 *  Update a specific blog post 
 * 
 *  Logic Flow
 *  1 - Check if the blog exist
 *  2 - Check if the user requested is the author
 *  3 - Update the blog   
 **/
const updateBlog = async (req, res) => {
    let body = req.value.body;
    let taskflow = new EventEmitter();

    taskflow.on("checkExistenceAndAuthorization", () => {
        BlogLayer.get({ _id: req.params?.id }, (err, blog) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating user" })
            if(!blog?._id) return res.status(404).json({ message: "Blog not found" })
            if(String(blog.author?._id) !== String(req._user?._id)) return res.status(403).json({ message: "You must be the author inorder to update this blog post" })
            taskflow.emit('update', blog._id)
        })
    })

    taskflow.on('update', (blogId) => {
        BlogLayer.update({ _id: blogId }, body, {}, (err, updatedBlog) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating blog post" });
            return res.status(201).json(updatedBlog);
        }) 
    })

    if(mongoose.isObjectIdOrHexString(req.params?.id)) taskflow.emit('checkExistenceAndAuthorization')
    else res.status(400).json({ message: "Invalid blog id given" })   
}


/* Remove a specific blog post */
const removeBlog = async (req, res) => {
    let taskflow = new EventEmitter();

    taskflow.on("checkExistenceAndAuthorization", () => {
        BlogLayer.get({ _id: req.params?.id }, (err, blog) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while updating user" })
            if(!blog?._id) return res.status(404).json({ message: "Blog not found" })
            if(String(blog.author?._id) !== String(req._user?._id)) return res.status(403).json({ message: "You must be the author inorder to delete this blog post" })
            taskflow.emit('remove', blog._id)
        })
    })

    taskflow.on('remove', (blogId) => {
        BlogLayer.remove({ _id: blogId }, (err, removedBlog) => {
            if(err) return res.status(500).json({ message: process.env.MODE == 'dev' ? err.message : "Error occured while removing this blog post" });
            return res.status(201).json({ "success": true, removedBlog });
        }) 
    })

    if(mongoose.isObjectIdOrHexString(req.params?.id)) taskflow.emit('checkExistenceAndAuthorization')
    else res.status(400).json({ message: "Invalid blog id given" })   
}


module.exports = { createBlog, getBlogs, getBlog, getAuthorBlogs, updateBlog, removeBlog };