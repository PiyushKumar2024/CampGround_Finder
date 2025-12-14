const express=require('express');
const router=express.Router();
const passport=require('passport');
const {storeReturnTo}=require('../middleware.js');
const { showRegPage, registerUser, showLoginPage, loginUser, logoutUser } = require('../controllers/user.js');

router.route('/register')
    .get('/register',showRegPage)
    .post('/register',registerUser)

router.route('/login')
    .get('/login',showLoginPage)

router
//catching the redirecturl as after successfull login the sesion gets cleared up in newer versions
router

router.get('/logout',logoutUser);

module.exports=router;