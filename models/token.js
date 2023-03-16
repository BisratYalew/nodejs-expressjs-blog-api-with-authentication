const mongoose  = require('mongoose');

const mongoosePaginate              = require('mongoose-paginate');

const Schema = mongoose.Schema;

var TokenSchema = new Schema({
  value:          { type: String },
  revoked:        { type: Boolean, default: false },
  user:           { type: Schema.Types.ObjectId, ref: 'users' },
  role:           { type: String },
  date_created:   { type: Date },
  last_modified:  { type: Date }
}, {timestamps:   { createdAt: 'date_created', updatedAt: 'last_modified'} });


TokenSchema.pre('save', function preSaveMiddleware(next) {
  var token = this;
  // Pre-Save Middlewares    
  next();
});

/**
 * Model Attributes to expose
 */
TokenSchema.statics.whitelist = {
  _id:              1,
  value:            1,
  revoked:          1,
  user:             1,
  role:             1,
  date_created:     1,
  last_modified:    1
};


// Expose Token model
module.exports = mongoose.model('tokens', TokenSchema);
