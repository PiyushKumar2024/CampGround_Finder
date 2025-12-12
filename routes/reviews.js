const express=require('express')
const router=express.Router({mergeParams:true})
const catchAsync=require('../helper/catchAsync.js')
const appError=require('../helper/error-class.js')
const Campground= require('../models/campground.js')
const Review=require('../models/review.js')
const reviewChecker=require('../models/reviewValidity.js')
const {isLoggedIn}=require('../isLoggedIn.js')

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

router.post('/',isLoggedIn,verifyReviews,catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    console.log(campground)
    req.flash('success','The review is successfully added')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:rId',isLoggedIn,catchAsync(async(req,res)=>{
    console.log('deleting reviews')
    const {id,rId}=req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:rId}})
    await Review.findByIdAndDelete(rId)
    req.flash('success','The review is successfully deleted')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports=router
