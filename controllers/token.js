const request = require('request-promise');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const redis_model = require('../redis/onetime_token');
const config = require('../config');
const mongoose = require('mongoose');
const Client = mongoose.model('oauth_clients');
const Tokens = mongoose.model('oauth_tokens');
const ObjectId = mongoose.mongo.ObjectId;

// POST
module.exports.get_token = async (req, res) => {
    let client;
    if(req.body.client_id != null && ObjectId.isValid(req.body.client_id) != false){
        client = await Client.findOne({_id: req.body.client_id}).exec();
    }
    switch (req.body.grant_type) {
        case 'password':
            if( ( req.body.client_id == null || ObjectId.isValid(req.body.client_id) == false ) || req.body.client_secret == null 
            || req.body.username == null || req.body.username.length < 4  || !req.body.username.match(/^\w+$/) 
            || req.body.password == null || req.body.password.length < 6 || !req.body.password.match(/^\w+$/)){
                return res.send({status: 400, error: {error_msg: "invalid_request"}});
            }
            if( client == null ) {
                return res.send({status: 401, error: {error_msg: "invalid_client"}}); 
            }
            if( client.client_secret != req.body.client_secret ){
                return res.send({status: 401, error: {error_msg: "invalid_client"}}); 
            }
            if( client.grant_types.indexOf(req.body.grant_type) < 0 ){
                return res.send({status: 401, error: {error_msg: "unsuported grant_type"}}); 
            }
            const onetime_token = await redis_model.set_onetime_token();
            const password_ckeck  = await request({
                method: 'GET',
                url: `http://${config.resourse_server.url}${config.resourse_server.port ? `:${config.resourse_server.port}` : ''}/users.password_check?v=1`,
                qs: {
                    username: req.body.username,
                    password: req.body.password,
                    onetime_token: onetime_token
                },
                json: true
            });
            if( password_ckeck.status == 200 ){
                const user_tokens = await Tokens.findOne({user_id: password_ckeck.user_id}).exec();
                if( user_tokens ) await user_tokens.remove();
                let access_token = bcrypt.hashSync(bcrypt.genSaltSync(5), 5);
                access_token = access_token.match(/05\$(.+)$/)[1];
                let refresh_token = bcrypt.hashSync(bcrypt.genSaltSync(5), 5);
                refresh_token = refresh_token.match(/05\$(.+)$/)[1];
                const tokens = await Tokens.create({
                    client_id: req.body.client_id,
                    user_id: password_ckeck.user_id,
                    refresh_token,
                    access_token,
                    access_expires: config.oauth.access_token_expires,
                    refresh_expires: config.oauth.refresh_token_expires,
                    expire_at: moment().add(config.oauth.refresh_token_expires, 's')
                });
                return res.send({status: 200,
                    access_token: access_token,
                    expires: config.oauth.access_token_expires,
                    refresh_token: refresh_token
                });
            } else {
                return res.send({status: 401, error: {error_msg: 'invalid_access'}});
            }
            break;
        case 'authorization_code':
            
            break;
        case 'refresh_token':
            if( ( req.body.client_id == null || ObjectId.isValid(req.body.client_id) == false ) || req.body.client_secret == null || req.body.refresh_token == null){
                return res.send({status: 400, error: {error_msg: "invalid_request"}});
            }
            if( client == null ) {
                return res.send({status: 401, error: {error_msg: "invalid_client"}}); 
            }
            if( client.client_secret != req.body.client_secret ){
                return res.send({status: 401, error: {error_msg: "invalid_client"}}); 
            }
            const user_tokes = await Tokens.findOne({$or: [
                {refresh_token: req.body.refresh_token},
                {prev_refresh_token: req.body.refresh_token}
            ]}).exec();
            if( user_tokes == void(0) ) {
                return res.send({status: 401, error: {error_msg: "invalid_token"}}); 
            }
            if( Math.round((Date.now() - user_tokes.create_at.getTime()) / 1000) < user_tokes.access_expires ){
                return res.send({status: 200,
                    access_token: user_tokes.access_token,
                    expires: user_tokes.access_expires,
                    refresh_token: user_tokes.refresh_token
                });
            }
            if( req.body.refresh_token == user_tokes.prev_refresh_token ){
                //Видалення пари токенів - токен зкомпроментований
                await user_tokes.remove();
                return res.send({status: 401, error: {error_msg: "destroy tokens"}}); 
            }
            let access_token = bcrypt.hashSync(bcrypt.genSaltSync(5), 5);
            access_token = access_token.match(/05\$(.+)$/)[1];
            let refresh_token = bcrypt.hashSync(bcrypt.genSaltSync(5), 5);
            refresh_token = refresh_token.match(/05\$(.+)$/)[1];
            user_tokes.access_token = access_token;
            user_tokes.refresh_token = refresh_token;
            user_tokes.prev_refresh_token = req.body.refresh_token;
            user_tokes.expire_at = moment().add(user_tokes.refresh_expires, 's');
            user_tokes.create_at = Date.now();
            await user_tokes.save();
            return res.send({status: 200,
                access_token: access_token,
                expires: user_tokes.access_expires,
                refresh_token: refresh_token
            });
            break;
        default:
            return res.send({status: 400, error: {error_msg: "invalid_grant"}}); 
            break;
    }
}

//GET
module.exports.token_info = async (req, res) => {
    try {
        if( req.query.access_token == null ){
            return res.send({status: 400, error: {error_msg: "invalid_request"}});
        }
        const user_tokens = await Tokens.findOne({access_token: req.query.access_token}).exec();
        if( user_tokens != void(0) ){

            if( Math.round((Date.now() - user_tokens.create_at.getTime()) / 1000) > user_tokens.access_expires ){
                return res.send({status: 401, error: {error_msg: 'invalid_token'}});
            }
            const user_info  = await request({
                method: 'GET',
                url: `http://${config.resourse_server.url}${config.resourse_server.port ? `:${config.resourse_server.port}` : ''}/users.get?v=1`,
                qs: {
                    user_ids: user_tokens.user_id
                },
                json: true
            });
            return res.send({status: 200, response: [
                {
                    create_at: user_tokens.create_at,
                    expires: user_tokens.access_expires,
                    user: user_info.response[0].user
                }
            ]});
        }
        return res.send({status: 401, error: {error_msg: 'invalid_token'}});
    } catch (error) {
        console.log('token info', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}

//GET
module.exports.logout = async (req, res) => {
    try {
        if( req.query.access_token == null ){
            return res.send({status: 400, error: {error_msg: "invalid_request"}});
        }
        const user_tokens = await Tokens.findOne({access_token: req.query.access_token}).exec();
        if( user_tokens != void(0) ){

            if( Math.round((Date.now() - user_tokens.create_at.getTime()) / 1000) > user_tokens.access_expires ){
                return res.send({status: 401, error: {error_msg: 'invalid_token'}});
            }
            if(req.query.all == 1){
                await Tokens.remove({user_id: user_tokens.user_id}).exec();
            } else {
                await Tokens.findOneAndRemove({access_token: req.query.access_token}).exec();
            } 
            return res.send({status: 200});
        } else {
            return res.send({status: 401, error: {error_msg: 'invalid_token'}});
        }
    } catch (error) {
        console.log('logout', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}