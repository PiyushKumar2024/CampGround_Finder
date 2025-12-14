 const mongoose=require('mongoose');
 const Schema=mongoose.Schema;
 const Review=require('./review');
 const User=require('./user');

 const campgrounds=new Schema({
     name:{
         type:String,
         required:true
     },
     price:{
         type:Number,
         required:true
     },
     description:{
         type:String,
         required:true
     },
     location:{
         type:String,
         required:true
     },
     image:{
         type:String
     },
     //author will be singular but there can be many reviews
     author:{
        type:Schema.Types.ObjectId,
        ref:'User'
     },
     reviews:[{
         type:Schema.Types.ObjectId,
         ref:'Review'
     }]
 })

 campgrounds.post('findOneAndDelete',async function(doc){
    console.log('Delete a campground')
    console.log(doc)
    if(doc){
         await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
 })

module.exports = mongoose.model('Campground', campgrounds)