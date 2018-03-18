const config = require('../config');
const request = require('request-promise');
const redis_model = require('../redis/onetime_token');

module.exports.register_user = async (req, res) => {
    try {
        let fio = String(req.body.fio).trim();
        if( !req.body.username || req.body.username.length < 4  || !req.body.username.match(/^\w+$/) ||
            !req.body.password || req.body.password.length < 6 || !req.body.password.match(/^\w+$/) ||
            !fio.match(/^[А-яіїєыЫІЇЄ]+\s[А-яіїєыЫІЇЄ]+\s[А-яіїєыЫІЇЄ]+$/) ||
            req.body.role == '' || (req.body.role == 'student' && !req.body.group) ){

            return res.send(400, {error: {error_msg: 'invalid_request'}});
        }

        const token = await redis_model.set_onetime_token();
        const response = await request({
            method: 'POST',
            url: `http://${config.resourse_server.url}${config.resourse_server.port ? `:${config.resourse_server.port}` : ''}/users.create`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: {
                v: req.body.v,
                username: req.body.username,
                password: req.body.password,
                fio: fio,
                role: req.body.role,
                group: req.body.group,
                onetime_token: token
            }
        });
        if (response.status == 200){
            return res.send({status: 200, user_id: response.user_id});
        } else {
            return res.send({status: response.status, error: response.error});
        }
        
    } catch (error) {
        console.log('register_user', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}