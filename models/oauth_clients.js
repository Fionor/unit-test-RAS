const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.ObjectId;
const oauth_clients_Schema = new mongoose.Schema({
    client_id: {
        type: String,
        required: true
    },
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
}, {_id: false, versionKey: false});

mongoose.model('oauth_clients', oauth_clients_Schema);