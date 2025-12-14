const express=require('express')
const router=express.Router({mergeParams:true})
const {isLoggedIn,verifyReviews,isReviewAuthor}=require('../middleware.js')
const { createReview, deleteReview } = require('../controllers/review.js')

router.post('/',isLoggedIn,verifyReviews,createReview)

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,deleteReview)

module.exports=router
