const express = require('express');
const router = express.Router();

const Authctrl = require('../controllers/auth');

router.post('/register', Authctrl.CreateUser);

module.exports = router;