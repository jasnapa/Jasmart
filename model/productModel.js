const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true 
    },
    subcategory:{
        type:String,
        required:true 
    },
    mrp:{
        type:Number,
        required:true 
    },
    price:{
        type:Number,
        required:true 
    },
    stock:{ 
        type:Number,
        required:true 
    },
    image:{
        type:Object,
    },
    SubImage:{
        type:Array
    },
    status:{
        type:Boolean,
        default:true
    },
    description:{
        type:String,
        required:true
    }
       
},{
    timestamps:true
})

const productModel = mongoose.model('product',productSchema)

module.exports= productModel