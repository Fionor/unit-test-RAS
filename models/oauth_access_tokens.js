const mongoose = require('mongoose');

const oauth_access_tokens_Schema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true,
        unique: true
    },
    client_id: {
        type: String,
        required: false,
        default: null
    },
    user_id: {
        type: String,
        required: false,
        default: null
    },
    expires: {
        type: Number,
        required: true
    },
    scope: {
        type: String,
        required: false,
        default: null
    }
}, {_id: false, versionKey: false});

mongoose.model('oauth_access_tokens', oauth_access_tokens_Schema);