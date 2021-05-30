const express=require('express');

const router=express.Router();

const UserCtrl=require('../controllers/users');
const AuthHelper=require('../Helpers/AuthHelper');

router.get('/users', AuthHelper.VerifyToken , UserCtrl.GetAllUsers);
router.get('/users/:id', AuthHelper.VerifyToken , UserCtrl.GetUser);
router.get('/usersname/:username', AuthHelper.VerifyToken , UserCtrl.GetUserByName);

module.exports = router;
