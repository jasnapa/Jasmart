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
            let monthlyData = []
            for (let i = 1; i <= 12; i++) {
                monthlyData[i - 1] = monthlyDataObject[i] ?? 0
            }
            let salesSum = monthlyDataArray.reduce((a, curr) => a + curr.total, 0);
            let users = await orderModel.distinct('userId')
            let userCount = users.length
            let deliveredOrder = 0;
            let PendingOrder = 0;
            let cancelOrder = 0;
            let Delivered = await orderModel.find({ orderStatus: 'Delivered' }).count()
            let Pending = await orderModel.find({ orderStatus: 'Pending' }).count()
            let Cancelled = await orderModel.find({ orderStatus: 'Cancelled' }).count()


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
    postAdminAddBanner: async (req, res) => {
        try {
            const { info, url } = req.body
            const image = req.files.image[0]
            let imageFile = await cloudinary.uploader.upload(image.path, { folder: 'JasMart' })
            let img = imageFile
            if (info.trim() !== "" || url.trim() !== "") {
                let banner = new bannerModel({ info, url, image: img })
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
            if (result.total) {
                //result[0]
                salesSum = result.total;
            }
        }
        let users = await orderModel.distinct('userId')
        let userCount = users.length

        res.render('adminSalesReport', { products, userCount, salesCount, salesSum })
    }

}

module.exports = adminController