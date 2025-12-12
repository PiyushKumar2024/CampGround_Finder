const express=require('express');
const router=express.Router();
const catchAsync=require('../helper/catchAsync.js');
const User=require('../models/user.js');
const passport=require('passport');
const {storeReturnTo}=require('../isLoggedIn.js');

router.get('/register',(req,res)=>{
    res.render('register.ejs');
})

router.post('/register',catchAsync(async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        const user=new User({username,email});
        //use register for registering 
        const registeredUser=await User.register(user,password);
        req.login(registeredUser,function(err){
            if(err){
                return next(err);
            }
            req.flash('success','Successfully registered you as the new user');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error',e.message);
        res.redirect('/register');
    }
}))

router.get('/login',(req,res)=>{
    res.render('login.ejs')
})

//catching the redirecturl as after successfull login the sesion gets cleared up
router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome back');
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports=router;