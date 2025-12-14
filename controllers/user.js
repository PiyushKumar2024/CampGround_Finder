const catchAsync=require('../helper/catchAsync.js');
const User=require('../models/user.js');
const passport=require('passport');
const {storeReturnTo}=require('../middleware.js');

module.exports.showRegPage=(req,res)=>{
    res.render('register.ejs');
}

module.exports.registerUser=catchAsync(async(req,res)=>{
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
})

module.exports.showLoginPage=(req,res)=>{
    res.render('login.ejs')
}

module.exports.loginUser=(req,res)=>{
    req.flash('success','Welcome back');
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logoutUser=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}