const mongoose = require('mongoose');
const Client = mongoose.model('oauth_clients');
const bcrypt = require('bcryptjs');

// POST
module.exports.create_client = async (req, res) => {
    try {
        const client_secret = bcrypt.genSaltSync(5);
        const grant_types = req.body.grant_types.split(',');
        await Client.create({
            name: req.body.name,
            client_secret,
            grant_types
        });
        res.send({status: 200});
    } catch (error) {
        console.log('error client create', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}