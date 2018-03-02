const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.ObjectId;
const oauth_clients_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    client_secret: {
        type: String,
        required: false,
        default: null
    },
    redirect_uri: {
        type: String,
        required: false,
        default: null
    },
    grant_types: {
        type: [String],
        required: false,
        default: null
    },
    scope: {
        type: String,
        required: false,
        default: null
    },
    user_id: {
        type: String,
        required: false,
        default: null
    }
}, {
    versionKey: false,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    }
});

oauth_clients_Schema.virtual('client_id').get(function(){
    return this._id;
});

mongoose.model('oauth_clients', oauth_clients_Schema);

