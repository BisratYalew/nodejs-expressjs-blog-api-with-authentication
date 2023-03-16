// Access Layer for Token Data.

/**
 * Load Module Dependencies.
 */
const debug         = require('debug')('api:dal-token');
const moment        = require('moment');
const _             = require('lodash');

const Token         = require('../models/token');
const User          = require('../models/user');

var returnFields    = Token.whitelist;

var population      =   [{
  path: 'user',
  select: User.whitelist
}];



exports.create = (tokenData, cb) => {

  // Create token if is new.
  let tokenModel  = new Token(tokenData);

  tokenModel.save((err, data) => {
      if (err) {
        return cb(err);
      }

    exports.get({ _id: data._id }, (err, token) => {
      if(err) {
        return cb(err);
      }
      
      cb(null, data);
    });

  });
};



exports.delete = (query, cb) => {

  Token
    .find(query, returnFields)
    .exec((err, tokens) => {
      if (err) {
        return cb(err);
      }

      if(!tokens) {
        return cb(null, { message: "No Tokens Found to Remove"});
      }

      var tokensOn = [];

      for(i=0; i<tokens.length; i++) {
        tokensOn.push(tokens[i]._id);
      }

     Token.remove({ _id: { $in: tokensOn }}, function(err, response) {
        if(err) {
         cb(null, {
            message: "Error Occured while removing"
          });
          return;
        
        } else {
          cb(null, {
            logged_out: true,
            message: "You have logged out from all devices"
          });
        }

     });

     //  token.remove((err) => {
     //    if(err) { return cb(err); }
     //    cb(null, token);
     //  });

  });
};


exports.update = (query, updates,  cb) => {

  let now = moment().toISOString();
  let opts = {
    'new': true,
    select: returnFields
  };

  Token
    .findOneAndUpdate(query, updates, opts)
    .populate(population)
    .exec((err, token) => {
      if(err) {
        return cb(err);
      }

      cb(null, token || {});
    });
};

exports.get = (query, cb) => {

  Token
    .findOne(query, returnFields)
    .populate(population)
    .exec((err, token) => {
      if(err) {
        return cb(err);
      }

      cb(null, token || {});

  });
};





exports.getCollection = (query, qs, cb) => {

  let opts = {
    columns:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    qs.limit
  };


  Token.paginate(query, opts, (err, docs, page, count) => {
    if(err) {
      return cb(err);
    }


    let data = {
      total_pages: page,
      total_docs_count: count,
      docs: docs
    };

    cb(null, data);

  });

};