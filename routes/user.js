const express=require('express');
const router=express.Router();
const catchAsync=require('../helper/catchAsync.js');
const User=require('../models/user.js');
const passport=require('passport');

router.get('/register',(req,res)=>{
    res.render('register.ejs');
})

router.post('/register',catchAsync(async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        const user=new User({username,email});
        //use register for registering 
        const registeredUser=await User.register(user,password);
        req.flash('success','Successfully registered you as the new user');
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('/register');
    }
}))

router.get('/login',(req,res)=>{
    res.render('login.ejs')
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome back');
    res.redirect('/campgrounds');
})

module.exports=router;