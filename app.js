const express=require("express")
const app=express()
const hbs=require("hbs")
const session = require("express-session")
const router=require('./router/userRouter')
const adminrouter=require('./router/adminRouter')
const connectDB = require("./config/dbConnect")
const path= require('path')
require('dotenv').config()


const cloudinary = require('cloudinary')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.static(path.resolve(__dirname,'public')))

app.set("view engine","hbs")

app.use(express.urlencoded({extended:true})) 
app.use(function(req, res, next){
    if(!req.user)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
hbs.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  });

app.use(session({ 
    secret:'key',
    resave: false,
    saveUninitialized:true

}))


connectDB()

app.use('/admin',adminrouter)

app.use('/',router)


app.listen(2000,console.log("http://localhost:2000"))
