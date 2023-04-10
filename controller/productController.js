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


let productController = {
    getAdminProduct: async (req, res) => {
        try {
            let product = await productModel.find({})
            res.render('adminProduct', { product })
        } catch (err) {
            console.log(err);

        }
    },
    getAdminAddProduct: async (req, res) => {
        try {
            let category = await categoryModel.find({}).lean()
            let sub = await categoryModel.findOne({}).distinct('subcategory')
            res.render('adminAddProduct', { category, sub })
        } catch (err) {
            console.log(err);

        }
    },
    postAdminAddProduct: async (req, res) => {
        try {
            const { name, category, subcategory, mrp, price, stock, description } = req.body
            if (name.trim() !== "" && mrp.trim() !== "" && price.trim() !== "" && stock.trim() !== "" && description.trim() !== "") {

                const image = req.files.image[0]
                const SubImage = req.files.SubImage
                let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'JasMart' })
                let productImg = imageFile

                for (let i in SubImage) {
                    let imageFile = await cloudinary.uploader.upload(SubImage[i].path, { folder: 'JasMart' })
                    SubImage[i] = imageFile
                }
                let product = new productModel({ name, category, subcategory, mrp, price, stock, description, image: productImg, SubImage: SubImage })
                await product.save()

                sharp(image.path)
                    .png()
                    .resize(300, 300, {
                        kernel: sharp.kernel.nearest,
                        fit: 'contain',
                        position: 'center',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .toFile(image.path + ".png")
                    .then(() => {
                        image.filename = image.filename + ".png"
                        image.path = image.path + ".png"
                    })
                res.redirect('/admin/products')
            } else {
                res.render('adminAddProduct', { error: true, message: 'please enter all the fields' })
            }
        } catch (err) {
            console.log(err);
        }


    },
    getAdminEditProduct: async (req, res) => {

        try {
            const _id = req.params.id;
            const product = await productModel.findById({ _id }).lean()
            let categories = await categoryModel.find({}).lean()
            let sub = await categoryModel.findOne({}).distinct('subcategory')
            res.render('adminEditProduct', {
                product,
                categories, sub,
                _id,
                name: product.name,
                description: product.description,
                category: product.category,
                subcategory: product.subcategory,
                mrp: product.mrp,
                price: product.price,
                stock: product.stock,
                image: product.image,
                SubImage: product.SubImage

            })
        } catch (err) {
            console.log(err);

        }
    },
    postAdminEditProduct: async (req, res) => {
        try {
            const SubImage = req.files.SubImage ?? []
            let image;
            let productImg
            const { name, category, subcategory, mrp, stock, price, description, _id } = req.body
            if (!req.files.image) {
                image= await productModel.findOne({ _id: _id }, { _id: 0, image: 1 })
                image=image.image
                productImg=image;
            }
            else{
                image = req.files.image[0]
                let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'JasMart' })
                productImg = imageFile
            }
            for (let i in SubImage) {
                let imageFile = await cloudinary.uploader.upload(SubImage[i].path, { folder: 'JasMart' })
                SubImage[i] = imageFile
            }
            if (name.trim() !== "" && mrp.trim() !== "" && price.trim() !== "" && stock.trim() !== "" && description.trim !== "") {
                const product = await productModel.findByIdAndUpdate(_id,
                    { $set: { name, category, subcategory, mrp, price, stock, description, image: productImg } }
                )
                // console.log(req.files.SubImage);
                // let length = 5 - product.SubImage.length
                // if (SubImage != null) {
                //     for (let i = 0; i < length; i++) {
                //         if (SubImage[i] != null) {
                //             product.SubImage.push(...SubImage)
                //         } else {
                //             break;
                //         }
                //     }
                // }
                await productModel.updateOne({ _id },
                    { $push: { SubImage: {$each:SubImage} } }
                )
                res.redirect('/admin/products')
            } else {
                res.render('adminEditCateg', { error: true, message: 'please enter all the fields' })
            }
        } catch (err) {
            console.log(err);

        }

    },
    getDeleteImage: async (req, res) => {

        let file = req.query.name
        await productModel.updateOne({ _id: req.params.id }, { $pull: { SubImage: { original_filename: file } } })
        res.redirect('back')
    },
    getAdminList: async (req, res) => {
        try {
            let _id = req.params.id
            await productModel.findByIdAndUpdate({ _id }, { status: true })
            res.redirect('/admin/products')
        } catch (err) {
            console.log(err);

        }
    },
    getAdminUnlist: async (req, res) => {
        try {
            let _id = req.params.id
            await productModel.findByIdAndUpdate({ _id }, { status: false })
            res.redirect('/admin/products')
        } catch (err) {
            console.log(err);

        }
    },
}

module.exports = productController