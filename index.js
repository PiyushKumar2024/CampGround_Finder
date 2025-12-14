const express = require('express');
const app = express();
const path = require('path');
const mongoose=require('mongoose');
const Campground= require('./models/campground.js');
const Review=require('./models/review.js');
const User=require('./models/user.js');
const catchAsync=require('./helper/catchAsync.js');
const appError=require('./helper/error-class.js');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');
const joi=require('joi');
const campgroundsChecker=require('./models/campgroundValidity.js');
const reviewChecker=require('./models/reviewValidity.js');
const campgroundsRoutes=require('./routes/campground.js');
const reviewsRoutes=require('./routes/reviews.js');
const authenticationRoutes=require('./routes/user.js');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');

// Debugging Middleware: Log every request to see if it reaches the server
app.use((req, res, next) => {
    console.log(`DEBUG: Incoming Request ${req.method} ${req.url}`);
    next();
});

const configObj={ //session config obj
    secret:'ThisshouldBeAddedInProduction',
    resave:false,
    saveUninitialized:true,
    cookie:{     //set preperty for cookies
        expire:Date.now()+1000*60*60*24*7, //in milli sec
        maxAge:1000*60*60*24*7,
        httpOnly:true  //for security purposes
    }
}

//flash and session middlewares should be above the passport 
app.use(session(configObj))
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('successfully connected with mongodb')
        console.log('yay')
    })
    .catch(err => {
        console.log('error in connection')
        console.log(err)
    })

app.engine('ejs',ejsMate) //setting ejs engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views')) //setting redering finding to views directory
app.use(express.static(path.join(__dirname,'public'))) //serve static assests from public dir 
app.use(express.urlencoded({extended:true})) //for api works
app.use(express.json()) //also for parsing reqbody
app.use(methodOverride('_method'))

//setting up routes
app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/',authenticationRoutes)

app.get('/', (req, res) => {
    res.render('landing')
})

//server start
app.listen(3000, () => {
    console.log('listening on port 3000')
})

//any other page then throw error
app.all(/(.*)/,(req,res,next)=>{
    next(new appError('page not found',404))
})

//error handling middleware (have an extra err signature)
app.use((err,req,res,next)=>{
    //default message and status code
    if(!err.message) err.message='Something went wrong'
    if(!err.status) err.status=500
    console.log(err)
    //render the custom page
    res.status(err.status).render('error_layout/error',{err})
})
