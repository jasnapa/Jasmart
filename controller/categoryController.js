const adminModel = require('../model/adminModel')
const categoryModel = require('../model/categoryModel')
const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const orderModel = require('../model/orderModel')
const sharp = require('sharp')
const multer = require('multer')
const bannerModel = require('../model/bannerModel')
const couponModel = require('../model/couponModel')
const cloudinary = require('cloudinary')
const path = require('path')


let categoryController = {
    getAdminCategory: async (req, res) => {
        try {
            let categories = await categoryModel.find({})
            res.render('adminCateg', { categories })
        } catch (err) {
            console.log(err);

        }
    },
    getAdminAddCategory: (req, res) => {

        res.render('adminAddCateg')
    },
    postAdminAddCategory: async (req, res) => {

        const { category, subcategory } = req.body
        const cat = await categoryModel.findOne({ category: category.trim().toLowerCase() })
        if (cat) {
            res.render('adminAddCateg', { error: true, message: "already exist" })
        } else {
            if (category.trim() !== "" && subcategory.trim() !== "") {
                let categ = new categoryModel({ category: category.trim().toLowerCase(), subcategory: subcategory.split(',') })
                await categ.save()
                res.redirect('/admin/category')
            } else {
                res.render('adminAddCateg', { error: true, message: 'please enter all the fields' })
            }

        }
    },
    getAdminEdit: async (req, res) => {
        try {
            const _id = req.params.id;
            const cate = await categoryModel.findById({ _id }).lean()

            res.render('adminEditCateg', {
                _id,
                category: cate.category,
                subcategory: cate.subcategory
            })
        } catch (err) {
            console.log(err);

        }

    },
    postAdminEdit: async (req, res) => {
        try {
            const { category, subcategory, _id } = req.body

            if (category.trim() !== "" && subcategory.trim() !== "") {
                await categoryModel.findByIdAndUpdate(
                    _id,
                    { $set: { category, subcategory: subcategory.split(',') } }
                )
                res.redirect('/admin/category')

            }
            else {
                res.render('adminEditCateg', { err: true, message: 'Please Enter all fields' })

            }
        } catch (err) {
            console.log(err);

        }
    },
    getAdminDelete: async (req, res) => {
        try {
            let _id = req.params.id
            await categoryModel.findByIdAndDelete({ _id })
            res.redirect('/admin/category')
        } catch (err) {
            console.log(err);

        }
    },
}

module.exports = categoryController