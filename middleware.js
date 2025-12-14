const catchAsync=require('./helper/catchAsync.js');
const appError=require('./helper/error-class.js');
const campgroundsChecker=require('./models/campgroundValidity.js');
const reviewChecker=require('./models/reviewValidity.js');
const Campground=require('./models/campground.js');
const Review=require('./models/review.js');

module.exports.storeReturnTo=(req,res,next)=>{
    //for storing the url from which you are coming
    if(req.session.returnTo){
        res.locals.returnTo=req.session.returnTo
    }
    next();
}

/*The 404 error occurs because when you try to submit a review (a POST request)
while not logged in, the isLoggedIn middleware saves the URL (/campgrounds/:id/reviews) 
to req.session.returnTo. After you log in, the application redirects you to that URL. 
However, browsers perform redirects as GET requests, and there is no GET route defined 
for /campgrounds/:id/reviews (only POST and DELETE), resulting in a "Page Not Found" error.

To fix this, we need to modify the isLoggedIn middleware to redirect users back to the 
campground show page (/campgrounds/:id) instead of the review submission endpoint when 
they are intercepted during a review actio
 */
module.exports.isLoggedIn=(req,res,next)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){

        if(req.originalUrl.includes('/reviews')){
            req.session.returnTo=req.originalUrl.split('/reviews')[0];
        } else {
            req.session.returnTo=req.originalUrl;
        }
        req.flash('error','You need to be logged in');
        return res.redirect('/login');
    }
    console.log(req.user);
    next();
}

module.exports.isAuthor=async (req,res,next)=>{
    const {id}=req.params;
    const camp=await Campground.findById(id);
    if(!camp){
        req.flash('error','No Campground is found');
        return res.redirect('/campgrounds');
    }
    if(!camp.author.equals(req.user._id)){
        req.flash('error','You are not permitted to do this');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor=async (req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You are not permitted to do this');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.verifyCampgrounds = catchAsync(async (req, res, next) => {
    const validation = campgroundsChecker.validate(req.body)
    if(validation.error){
        const message = validation.error.details.map(detail => detail.message)
        throw new appError(message, 400)
    }
    else{
        next()
    }
})

module.exports.verifyReviews=(req,res,next)=>{
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