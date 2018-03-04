const redis_model = require('../redis/onetime_token');

module.exports.get_token = async (req, res) => {
    try{
        if( ( req.query.onetime_token == null || req.query.onetime_token == '' ) ){
            return res.send({status: 400, error: {error_msg: 'invalid_request'}});
        }
        const result = await redis_model.get_onetime_token(req.query.onetime_token);
        if( result ){
            return res.send({response: [{onetime_token: Boolean(result)}]});
        } else {
            return res.send({status: 400, error: {error_msg: 'invalid_onetime_token'}});
        }
    } catch (e) {
        console.log('get_token', e);
        res.send(500, e);
    }
}
