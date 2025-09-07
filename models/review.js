const mongooose = require('mongoose')
const { type } = require('yod')
const Schema = mongooose.Schema

const review = new Schema({
    // name: {
    //     type: String,
    //     required: true
    // },
    date: {
        type: Date,
        default:Date.now
    },
    body: { type: String },
    rating: { type: Number }
})

module.exports = mongooose.model('Review', review)