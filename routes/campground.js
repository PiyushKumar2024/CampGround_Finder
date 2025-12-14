const express=require('express');
const router=express.Router();
const {isLoggedIn,isAuthor,verifyCampgrounds}=require('../middleware.js');

const { loadAllCamp, createNewCamp, loadUpdatePage, 
    updateCampground, deleteCampground, createNewCampground, 
    loadAllCampground, showOneCampground, 
    newCampPage} = require('../controllers/campgrounds.js');

router.route('/')
    .get(loadAllCampground)
    .post(isLoggedIn,verifyCampgrounds,createNewCampground)  

router.get('/new',isLoggedIn,newCampPage)

router.route('/:id')
    .patch(isLoggedIn,isAuthor,updateCampground)
    .delete(isLoggedIn,isAuthor,deleteCampground)
    .get(showOneCampground)

router.get('/edit/:id',isLoggedIn,isAuthor,loadUpdatePage)

module.exports=router