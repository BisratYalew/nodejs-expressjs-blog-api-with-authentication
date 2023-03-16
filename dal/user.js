const User         = require('../models/user');

const returnFields = User.whitelist;


const create = async (userData, cb) => {
    let body = await new User(userData);

    await User(body).save((err, user) => {
        if(err) return cb(err);
        return cb(null, user);
    })
}


const get = async (query, cb) => {
   
    await User.findOne(query)
          .select(returnFields)
          .exec((err, user) => {
            if(err) return cb(err);
            cb(null, user || {});
        })
}

const count = async (query, cb) => {    
    await User.countDocuments(query)
          .exec((err, num) => {
            if(err) cb(err);
            cb(null, num);
        })
}

const getCollection = (query, qs, cb) => {
  
    let opts = {
      select: returnFields,
      sort: {
          date_created: -1
      },
      page: Number(qs.page) || 1,
      limit: Number(qs.per_page) || 10
    };
  
    User.paginate(query, opts, (err, data) => {
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
  

const search = (text, cb) => {
   
    User.find({ $text: { $search: text }}, (err, data) => {
      if(err) return cb(err);       
      cb(null, data);  
    });  

}; 

const update = async (query, updates, opts, cb) => {

    await User
        .findOneAndUpdate(query, updates, opts)
        .exec(async (err, user) => {

            if(err) return cb(err);
            if(!user) return cb(null, {});
            await get(query, (err, userUpdated) => {
                if(err) return cb(err);
                cb(null, userUpdated || {});
            })
            
    });
}


const remove = (query, cb) => { 

    User
        .findOne(query, returnFields)
        .exec((err, user) => {
        if (err) return cb(err);    
        if(!user) {
            return cb(null, false);
        }
    
        user.remove((err) => {
            if(err) return cb(err);    
            cb(null, user || {});    
        });   
    });

};   



module.exports = {
    create, get, getCollection, count, update, remove, search
}