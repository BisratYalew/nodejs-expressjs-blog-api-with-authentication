const mongoose           = require('mongoose');
const mongoosePaginate   = require('mongoose-paginate');

const BlogSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
            unique: true
        },
        content: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        tags: {
            type: Array,
            required: false
        }
    },
    {
        timestamps: true
    }
);

mongoose.plugin(mongoosePaginate);

module.exports = mongoose.model("blogs", BlogSchema);