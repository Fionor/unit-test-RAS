const express = require('express');
const router = express.Router();

const ctrl_token = require('../controllers/token');
const ctrl_client = require('../controllers/client');
const ctrl_onetime_token = require('../controllers/onetime_token');
const ctrl_user = require('../controllers/user');

router.post('/token', ctrl_token.get_token);

router.post('/client', ctrl_client.create_client);

router.get('/onetime_token', ctrl_onetime_token.get_token);

router.post('/user', ctrl_user.register_user);

module.exports = router;