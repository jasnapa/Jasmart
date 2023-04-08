const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({

    image:{
        type:Object,
    },
    url:{
        type:String,
        required:true
    },
    info:{
        type:String,
        required:true
    }
})

const bannerModel = mongoose.model('banner',bannerSchema)

module.exports= bannerModel