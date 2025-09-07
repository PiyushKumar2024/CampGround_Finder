const express = require('express')
const app = express()
const path = require('path')
const mongoose=require('mongoose')
const Campground= require('./models/campground.js')
const Review=require('./models/review.js')
const catchAsync=require('./helper/catchAsync.js')
const appError=require('./helper/error-class.js')
const methodOverride = require('method-override')
const ejsMate=require('ejs-mate')
const joi=require('joi')
const campgroundsChecker=require('./models/campgroundValidity.js')
const reviewChecker=require('./models/reviewValidity.js')

const campgrounds=require('./routes/campground.js')
const reviews=require('./routes/reviews.js')


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('successfully connected with mongodb')
        console.log('yay')
    })
    .catch(err => {
        console.log('error in connection')
        console.log(err)
    })


app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname,'public')))

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(methodOverride('_method'))
app.use('/campgrounds',campgrounds)
app.use('/campgrounds/:id/reviews',reviews)

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

const verifyReviews=(req,res,next)=>{
    console.log(req.body.review)
    const validation=reviewChecker.validate(req.body.review)
    if(validation.error){
        const message=validation.error.details.map(detail => detail.message)
        throw new appError(message,500)
    }
    else{
        next()
    }
}

app.listen(3000, () => {
    console.log('listening on port 3000')
})




app.all(/(.*)/,(req,res,next)=>{
    next(new appError('page not found',404))
})

app.use((err,req,res,next)=>{
    if(!err.message) err.message='Something went wrong'
    if(!err.status) err.status=500
    console.log(err)
    res.status(err.status).render('error_layout/error',{err})
})
