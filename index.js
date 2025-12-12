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

//using routes from router
const campgroundsRoutes=require('./routes/campground.js');
const reviewsRoutes=require('./routes/reviews.js');
const authenticationRoutes=require('./routes/user.js');

// Debugging Middleware: Log every request to see if it reaches the server
app.use((req, res, next) => {
    console.log(`DEBUG: Incoming Request ${req.method} ${req.url}`);
    next();
});

const session=require('express-session');
const flash=require('connect-flash');

//passprt authentication
const passport=require('passport');
const LocalStrategy=require('passport-local');

//setting up session
const configObj={
    secret:'ThisshouldBeAddedInProduction',
    resave:false,
    saveUninitialized:true,
    //set preperty for cookies
    cookie:{
        //in milli sec
        expire:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        //for security purposes
        httpOnly:true
    }
}
app.use(session(configObj))
app.get('/test-session',(req,res)=>{
    //session will be created only when we are using it 
    req.session.test="working session"
    res.send("The session should we working now")
})

//flash session and middlewares
app.use(flash())
app.use((req,res,next)=>{
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('successfully connected with mongodb')
        console.log('yay')
    })
    .catch(err => {
        console.log('error in connection')
        console.log(err)
    })

//setting ejs engine
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')

//setting redering finding to views directory
app.set('views', path.join(__dirname, 'views'))

//serve static assests from public dir 
app.use(express.static(path.join(__dirname,'public')))


//for api works
app.use(express.urlencoded({extended:true}))
app.use(express.json())


app.use(methodOverride('_method'))

//setting up routes
app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/',authenticationRoutes)

app.get('/fakeUser',async (req,res)=>{
    const user=new User({email:'myname@maild.com',username:'Piyus'});
    const newUser=await User.register(user,'kumarYadav');
    res.send(newUser);
})


//camprground validation
const verifyCampgrounds=(req,res,next)=>{
    const validation=campgroundsChecker.validate(req.body)
    if(validation.error){
        const message=validation.error.details.map(detail => detail.message)
        throw new appError(message,500)
    }
    else{
        next()
    }
}


//reviews validation
const verifyReviews=(req,res,next)=>{
    console.log(req.body.review)
    const validation=reviewChecker.validate(req.body.review)
    if(validation.error){
        const message=validation.error.details.map(detail => detail.message)
        throw new appError(message,500)
    }
    else{
        //for next call
        next()
    }
}

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
