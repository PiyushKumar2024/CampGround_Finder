const express = require('express')
const app = express()
const path = require('path')
const mongoose=require('mongoose')

//models
const Campground= require('./models/campground.js')
const Review=require('./models/review.js')

//custom error handlers
const catchAsync=require('./helper/catchAsync.js')
const appError=require('./helper/error-class.js')

//method override for forms
const methodOverride = require('method-override')

//for ejs
const ejsMate=require('ejs-mate')

//for validation 
const joi=require('joi')
const campgroundsChecker=require('./models/campgroundValidity.js')
const reviewChecker=require('./models/reviewValidity.js')


//using routes from router
const campgrounds=require('./routes/campground.js')
const reviews=require('./routes/reviews.js')

//setting up session
const session=require('express-session')
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
const flash=require('connect-flash')
app.use(flash())
app.use((req,res,next)=>{
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})

//connecting to mongoose
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
app.use('/campgrounds',campgrounds)
app.use('/campgrounds/:id/reviews',reviews)


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
