const express = require('express');
const router = express.Router();

const Authctrl = require('../controllers/auth');

router.post('/register', Authctrl.CreateUser);
router.post('/login', Authctrl.LoginUser)

module.exports = router;