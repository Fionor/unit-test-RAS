const mongoose = require('mongoose');

const oauth_refresh_tokens_Schema = new mongoose.Schema({
    refresh_token: {
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
        type: String,
        required: true,
    },
    scope: {
        type: String,
        required: false,
        default: null
    }
}, {_id: false, versionKey: false});

mongoose.model('oauth_refresh_tokens', oauth_refresh_tokens_Schema);