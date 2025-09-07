const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedhelper')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('successfully connected with mongodb')
        console.log('yay')
    })
    .catch(err => {
        console.log('error in connection')
        console.log(err)
    })



const seed = async () => {
    await Campground.deleteMany()
    for (let i = 0; i < 100; i++) {
        const random = Math.floor(Math.random()*cities.length)
        const camp = new Campground({
            location: `${cities[random].city},${cities[random].state}`,
            price: Math.floor((Math.random()) * 1000 + 200),
            description: 'just a random campgrounds',
            image: 'https://picsum.photos/256/256',
            name: `${descriptors[random % (descriptors.length)]} ${places[random % (places.length)]}`
        })
        await camp.save()
    }
}
seed()
.then(()=>{
    console.log('Data base successfully seeded')
})
.catch((err)=>{
    console.log(err)
})