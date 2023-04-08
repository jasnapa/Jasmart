const express=require('express')
const { getAdminLogin, postAdminDash, getAdminUser, getAdminDash, getAdminBlock, getAdminUnblock, getAdminCategory, getAdminAddCategory, postAdminAddCategory, getAdminEdit, postAdminEdit, getAdminDelete, getAdminProduct, getAdminAddProduct, postAdminAddProduct, getAdminEditProduct, postAdminEditProduct, getAdminList, getAdminUnlist, getAdminLogout, getAdminOrder, getAdminBanner, getAdminAddBanner, postAdminAddBanner, postAdminBannerDelete, getAdminCoupon, getAdminAddCoupon, postAdminCoupon, getAdminCouponDelete, getDeleteImage, getAdminSalesReport, getOrderView } = require('../controller/adminController')
const router=express.Router()
const multiUpload = require('../middleware/multer')
const verifyAdmin = require('../middleware/verifyAdmin')



router.get('/',getAdminLogin)
router.post('/home',postAdminDash) 
router.get('/dash',getAdminDash)
router.use(verifyAdmin)
router.get('/user', verifyAdmin, getAdminUser)
router.get('/block/:id', verifyAdmin, getAdminBlock)
router.get('/unblock/:id', verifyAdmin, getAdminUnblock)
router.get('/category', verifyAdmin, getAdminCategory)
router.get('/addcategory', verifyAdmin, getAdminAddCategory)
router.post('/newCategory', verifyAdmin, postAdminAddCategory)
router.get('/edit/:id', verifyAdmin, getAdminEdit)
router.post('/editCategory',verifyAdmin, postAdminEdit)
router.get('/delete/:id', verifyAdmin, getAdminDelete)
router.get('/products', verifyAdmin, getAdminProduct)
router.get('/addproduct', verifyAdmin, getAdminAddProduct)
router.post('/addNewProduct',multiUpload, verifyAdmin, postAdminAddProduct)
router.get('/editProduct/:id', verifyAdmin, getAdminEditProduct)
router.get('/deleteImage/:id', verifyAdmin, getDeleteImage)
router.post('/editProduct',multiUpload, verifyAdmin, postAdminEditProduct)
router.get('/list/:id', verifyAdmin, getAdminList)
router.get('/unlist/:id', verifyAdmin, getAdminUnlist)
router.get('/Adminlogout', verifyAdmin, getAdminLogout)
router.get('/order', verifyAdmin, getAdminOrder)
router.get('/orderView/:id', verifyAdmin, getOrderView)
router.get('/banner', verifyAdmin, getAdminBanner)
router.get('/addbanner', verifyAdmin, getAdminAddBanner)
router.post('/addbanner',multiUpload, verifyAdmin, postAdminAddBanner)
router.get('/bannerDelete/:id', verifyAdmin, postAdminBannerDelete)
router.get('/coupon', verifyAdmin, getAdminCoupon)
router.get('/addCoupon', verifyAdmin, getAdminAddCoupon)
router.post('/coupon', verifyAdmin, postAdminCoupon)
router.get('/deleteCoupon/:id', verifyAdmin, getAdminCouponDelete)
router.get('/salesReport', verifyAdmin, getAdminSalesReport)











module.exports=router