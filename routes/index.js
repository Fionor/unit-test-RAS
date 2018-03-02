const express = require('express');
const router = express.Router();

const ctrl_token = require('../controllers/token');
const ctrl_client = require('../controllers/client');

router.post('/token', ctrl_token.get_token);

router.post('/client', ctrl_client.create_client);

module.exports = router;