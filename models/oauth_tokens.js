const mongoose = require('mongoose');

const oauth_tokens_Schema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true,
        unique: true
    },
    refresh_token: {
        type: String,
        required: true,
        unique: true
    },
    prev_refresh_token: {
        type: String,
        required: false,
        default: null
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
    access_expires: {
        type: Number,
        required: true
    },
    refresh_expires: {
        type: Number,
        required: true
    },
    scope: {
        type: String,
        required: false,
        default: null
    },
    create_at: { type: Date, default: Date.now },
    expire_at: { type: Date, default: undefined }
}, {versionKey: false});

oauth_tokens_Schema.index({ "expire_at": 1 }, { expireAfterSeconds: 0 });

mongoose.model('oauth_tokens', oauth_tokens_Schema);