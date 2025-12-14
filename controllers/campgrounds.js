const catchAsync=require('../helper/catchAsync.js');
const appError=require('../helper/error-class.js');
const Campground= require('../models/campground.js');
const Review=require('../models/review.js');
const campgroundsChecker=require('../models/campgroundValidity.js');
const flash=require('connect-flash');

module.exports.loadAllCampground=catchAsync(async(req,res)=>{
    const data=await Campground.find({})
    res.render('home',{data})
})

module.exports.createNewCampground=catchAsync(async(req,res)=>{
    const {name,price,location,description}=req.body
    const camp=new Campground({name,price,location,description})
    camp.author=req.user;
    console.log(req.user);
    await camp.save()
    req.flash('success','The campground is successfully created')//set up flash
    res.redirect('/campgrounds') //to display it just set up a middleware
})

module.exports.loadUpdatePage=catchAsync(async(req,res)=>{
    const {id}=req.params;
    const data=await Campground.findById(id);
    res.render('update.ejs',{data})
})

module.exports.updateCampground=catchAsync(async(req,res)=>{
    const {id}=req.params;
    const camp=await Campground.findByIdAndUpdate(id,req.body);
    req.flash('success','The campground is successfully updated');
    res.redirect(`/campgrounds/${id}`);
})

module.exports.deleteCampground=catchAsync(async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success','The campground is successfully deleted')
    res.redirect('/campgrounds')
})

module.exports.showOneCampground=catchAsync(async(req,res)=>{
    const {id}=req.params
    /* faster query for dbS
    const camp=await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');*/
    const camp=await Campground.findById(id).populate('reviews').populate('author');
    for(review of camp.reviews){
        await review.populate('author');
    }
    if(!camp){
        req.flash('error',"The campground doesnt exist")
        return res.redirect('/campgrounds')
    }
    res.render('campground',{camp})
})

module.exports.newCampPage=(req,res)=>{
    res.render('new-camp')
}