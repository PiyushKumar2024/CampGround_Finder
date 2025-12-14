const express=require('express');
const router=express.Router();
const passport=require('passport');
const {storeReturnTo}=require('../middleware.js');
const { showRegPage, registerUser, showLoginPage, loginUser, logoutUser } = require('../controllers/user.js');

router.route('/register')
    .get(showRegPage)
    .post(registerUser)

router.route('/login')
    .get(showLoginPage)
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),loginUser)

router.get('/logout',logoutUser);

module.exports=router;