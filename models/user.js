const mongoose          = require('mongoose');
const mongoosePaginate  = require('mongoose-paginate');

const bcrypt            = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstname:     { type: String, required: true },
    lastname:      { type: String, required: true },
    email:         { type: String },
    password:      { type: String },
    profile_image: { type: String, required: false },
    date_created:  { type: Date },
    last_modified: { type: Date }
},  { timestamps:  { createdAt: 'date_created', updatedAt: 'last_modified' } });

UserSchema.pre('save', async function(next) {
  try {    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(this.password, salt);
    this.password = passwordHash;
    next();
  } catch(error) {
    next(error);
  }
});
  
UserSchema.methods.verifyPassword = async function(password, cb) {
  try {
    await bcrypt.compare(password, this.password, function done(err, isMatch) {
        if(err) {
          return cb(err);
        }
        cb(null, isMatch);
      });
  } catch (error) {
      throw new Error(error);
  }
}

/** User Model Attributes to expose */
UserSchema.statics.whitelist = {
	_id: 			      1,
	firstname: 	    1,
	lastname: 	    1,	
	email:      	  1,
  profile_image:  1,
  date_created:   1,
  last_modified:  1,
};

mongoose.plugin(mongoosePaginate);

module.exports = mongoose.model('users', UserSchema);