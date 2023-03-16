const Blog = require('../models/blog');
const User = require('../models/user');

let returnFields = Blog.whitelist;



// Create a Blog
exports.create = async (blogData, cb) => {
  let body = await new Blog(blogData);

  await Blog(body).save((err, blog) => {
      if(err) return cb(err);
      return cb(null, blog);
  })
}



// Get a collection of Blogs
exports.getCollection = async (query, qs, cb) => {

    const population = [{ path: 'author', select: { firstname: 1, lastname: 1, profile_image: 1, email: 1 } }]

    let opts = {
      select: returnFields,
      populate: population,
      sort: {
          date_created: -1
      },
      page: Number(qs.page) || 1,
      limit: Number(qs.per_page) || 10
    }; 
    

    Blog.paginate(query, opts, (err, data) => {
      if(err) return cb(err);   
        
      let response = {
        page: data.page,
        total_docs: data.total,
        total_pages: data.pages,
        per_page: data.limit,
        docs: data.docs
      }
  
      cb(null, response);
  
    });  
};



// Get Blog
exports.get = async (query, cb) => {
   
    await Blog.findOne(query)
          .populate({ path: 'author', select: User.whitelist })
          .exec((err, blog) => {
            if(err) return cb(err);
            cb(null, blog || {});
        })
}

// Search Blogs
exports.search = (keyword, cb) => {
   
    Blog.find({ $text: { $search: keyword }}, (err, data) => {
        if(err) return cb(err);       
        cb(null, data);
    
    });  
}

// Update Blog
exports.update = async (query, updates, opts, cb) => {
  await Blog
      .findOneAndUpdate(query, updates, opts)
      .exec((err, blog) => {
          if(err) return cb(err);
          this.get({ _id: blog?._id }, (err, blog) => {
            if(err) return cb(err);
            cb(null, blog || {});
          })
  });
}

// Remove Blog
exports.remove = (id, cb) => {
    Blog.findByIdAndRemove(id, cb);
};
