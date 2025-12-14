const catchAsync=require('../helper/catchAsync.js')
const appError=require('../helper/error-class.js')
const Campground= require('../models/campground.js')
const Review=require('../models/review.js')
const reviewChecker=require('../models/reviewValidity.js')

module.exports.createReview=catchAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    review.author=req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    console.log(campground)
    req.flash('success','The review is successfully added')
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteReview=catchAsync(async(req,res)=>{
    const {id,reviewId}=req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','The review is successfully deleted')
    res.redirect(`/campgrounds/${id}`)
})