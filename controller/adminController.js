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
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



var adminController = {

    getAdminLogin: (req, res) => {
        res.render('adminLogin')
    },
    getAdminDash: async (req, res) => {
        try {
            let salesCount = await orderModel.find({ orderStatus: 'Delivered' }).count();

            let monthlyDataArray = await orderModel.aggregate([{
                $match: { orderStatus: 'Delivered' }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: {
                        $sum: '$total'
                    }
                }
            }])
            let monthlyDataObject = {}
            monthlyDataArray.map(item => {
                monthlyDataObject[item._id] = item.total
            })
            console.log(monthlyDataArray);
            let monthlyData = []
            for (let i = 1; i <= 12; i++) {
                monthlyData[i - 1] = monthlyDataObject[i] ?? 0
            }
            console.log(monthlyData);
            let salesSum = monthlyDataArray.reduce((a, curr) => a + curr.total, 0);
            let users = await orderModel.distinct('userId')
            let userCount = users.length
            let deliveredOrder = 0;
            let PendingOrder = 0;
            let cancelOrder = 0;
            let Delivered = await orderModel.find({ orderStatus: 'Delivered' }).count()
            let Pending = await orderModel.find({ orderStatus: 'Pending' }).count()
            let Cancelled = await orderModel.find({ orderStatus: 'Cancelled' }).count()

            console.log(Delivered);
            console.log(Cancelled);


            res.render('adminDash', { salesCount, salesSum, userCount, monthlyData, Delivered, Pending, Cancelled })

        } catch (err) {
            console.log(err);
        }
    },

    postAdminDash: async (req, res) => {
        try {
            const { email, password } = req.body
            if (email.trim() == "" || password.trim() == "") {
                res.render('adminLogin', { invalid: true })
            }
            else {
                let admin = await adminModel.findOne({ email })
                if (admin) {
                    if (admin.email == email && admin.password == password) {
                        req.session.admin = admin.name
                        res.redirect('/admin/dash')
                    }
                    else {
                        res.render('adminLogin', { wrong: true })
                    }
                } else {
                    res.render('adminLogin', { error: true })
                }
            }
        } catch (err) {
            console.log(err);
        }


    },
    getAdminUser: async (req, res) => {
        try {
            let users = await userModel.find({}).lean()
            res.render('adminUser', { users })
        } catch (err) {
            console.log(err);

        }
    },
    getAdminBlock: async (req, res) => {
        try {
            let _id = req.params.id
            await userModel.findByIdAndUpdate({ _id }, { block: true })
            res.redirect('/admin/user')
        } catch (err) {
            console.log(err);

        }
    },
    getAdminUnblock: async (req, res) => {
        try {
            let _id = req.params.id
            await userModel.findByIdAndUpdate({ _id }, { block: false })
            res.redirect('/admin/user')
        } catch (err) {
            console.log(err);

        }
    },
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
        console.log(cat);
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
            const image = req.files.image[0]
            const SubImage = req.files.SubImage
            console.log(image);
            let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'JasMart' })
            let productImg = imageFile
            console.log("shjhsaj", imageFile);

            for (let i in SubImage) {
                let imageFile = await cloudinary.uploader.upload(SubImage[i].path, { folder: 'JasMart' })
                SubImage[i] = imageFile
            }
            const { name, category, subcategory, mrp, stock, price, description, _id } = req.body
            if (name.trim() !== "" && mrp.trim() !== "" && price.trim() !== "" && stock.trim() !== "" && description.trim !== "") {
                const product = await productModel.findByIdAndUpdate(_id,
                    { $set: { name, category, subcategory, mrp, price, stock, description, image: productImg } }
                )

                let length = 5 - product.SubImage.length
                if (req.files.SubImage != null) {
                    console.log(length, product.SubImage.length);
                    for (let i = 0; i < length; i++) {
                        if (req.files.SubImage[i] != null) {
                            product.SubImage.push(...SubImage)
                        } else {
                            break;
                        }
                    }
                }
                await productModel.updateOne({ _id },
                    { $set: { SubImage: product.SubImage } }
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
    getAdminLogout: (req, res) => {
        res.redirect('/admin/')
    },
    getAdminOrder: async (req, res) => {
        try {
            let status = req.query.status
            const _id = req.query.id
            if (status) {
                if (status == "Delivered") {
                    await orderModel.updateOne({ _id }, { paid: true })
                }
                await orderModel.updateOne({ _id }, { orderStatus: status })
            }
            let order = await orderModel.find({})
            res.render('adminOrder', { order })

        } catch (err) {
            console.log(err);

        }

    },
    getOrderView: async (req, res) => {
        let _id = req.params.id
        let order = await orderModel.findById({ _id })
        console.log(order);
        res.render('adminOrderView', { order })
    },
    getAdminBanner: async (req, res) => {
        try {
            let banner = await bannerModel.find({})
            res.render('adminBanner', { banner })
        } catch (err) {
            console.log(err);
        }
    },
    getAdminAddBanner: (req, res) => {
        res.render('adminAddBanner')
    },
    postAdminAddBanner:async (req, res) => {
        try {
            const { info, url } = req.body
            const image = req.files.image[0]
            let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'JasMart' })
            let img = imageFile
            if (info.trim() !== "" || url.trim() !== "") {
                let banner = new bannerModel({ info, url, image:img })
                banner.save()
                res.redirect('/admin/banner')

            } else {
                res.render('adminAddBanner', { error: true, message: 'please enter all the fields' })
            }

        } catch (err) {
            console.log(err);
        }

    },
    postAdminBannerDelete: async (req, res) => {
        try {
            let _id = req.params.id
            await bannerModel.findByIdAndDelete({ _id })
            res.redirect('/admin/banner')
        }
        catch (err) {
            console.log(err);
        }
    },
    getAdminCoupon: async (req, res) => {
        let coupon = await couponModel.find({})
        res.render('adminCoupon', { coupon })
    },
    getAdminAddCoupon: (req, res) => {

        res.render('adminAddCoupon')
    },
    postAdminCoupon: async (req, res) => {
        const { name, code, minamount, maxamount, cashback, expiry } = req.body
        if (name.trim() !== "" || code.trim() !== "" || minamount.trim() !== "" || maxamount.trim() !== "" || cashback.trim() !== "" || expiry.trim() !== "") {
            let coupon = new couponModel({ name, code, minamount, maxamount, cashback, expiry })
            coupon.save()
            res.redirect('/admin/coupon')

        } else {
            res.render('adminAddCoupon', { error: true, message: 'please enter all the fields' })
        }

    }, getAdminCouponDelete: async (req, res) => {
        try {
            let _id = req.params.id
            await couponModel.findByIdAndDelete({ _id })
            res.redirect('/admin/coupon')
        } catch (err) {
            console.log(err);

        }
    },
    getAdminSalesReport: async (req, res) => {
        let from = req.query.from
        let to = req.query.to
        let products
        let salesCount
        let result
        let salesSum
        let order
        if (from) {
            order = await orderModel.find({ createdAt: { $gte: from, $lt: to } }).lean()
            products = order.filter(e => e.orderStatus == 'Delivered')
            salesCount = await orderModel.find({ createdAt: { $gte: from, $lt: to } }, { orderStatus: 'Delivered' }).count()

            salesSum = products.reduce((a, curr) => a + curr.total, 0);
        } else {
            products = await orderModel.find({ orderStatus: 'Delivered' })
            console.log(products);
            salesCount = await orderModel.find({ orderStatus: 'Delivered' }).count();
            result = await orderModel.aggregate([{
                $match: { orderStatus: 'Delivered' }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$total'
                    }
                }
            }])
            if (result[0].total) {
                salesSum = result[0].total;
            }
        }
        let users = await orderModel.distinct('userId')
        let userCount = users.length

        res.render('adminSalesReport', { products, userCount, salesCount, salesSum })
    }

}

module.exports = adminController