const express=require('express');
const router=express.Router();
const catchAsync=require('../helper/catchAsync.js')
const appError=require('../helper/error-class.js')
const Campground= require('../models/campground.js')
const Review=require('../models/review.js')
const campgroundsChecker=require('../models/campgroundValidity.js')

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

router.get('',catchAsync(async(req,res)=>{
    const data=await Campground.find({})
    res.render('home',{data})
}))

router.post('',verifyCampgrounds,catchAsync(async(req,res)=>{
    const {name,price,location,description}=req.body
    const camp=new Campground({name,price,location,description})
    await camp.save()
  res.redirect('/campgrounds')
}))

router.get('/edit/:id',catchAsync(async(req,res)=>{
    const {id}=req.params
    const data=await Campground.findById(id)
    res.render('update.ejs',{data})
}))

router.patch('/:id',catchAsync(async(req,res)=>{
    const {id}=req.params
    const camp=await Campground.findByIdAndUpdate(id,req.body)
    res.redirect('/campgrounds')
}))

router.delete('',catchAsync(async(req,res)=>{
    const {id}=req.query
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

router.get('/new', (req,res)=>{
    res.render('new-camp')
})

router.get('/:id', catchAsync(async(req,res)=>{
    const {id}=req.params
    const camp=await Campground.findById(id).populate('reviews')
    res.render('campground',{camp})
}))

module.exports=router