const express = require("express")
const { getUserLogin, getUserSignup, postRegister, getOtp, postSendOtp, getUserHome, postUserLogin, getProducts, postProductSearch, getAdminViewProduct, getAddToCart, getCart, getCheckout, getUserLogout, getDeleteCart, getUserQuantityUpdate, resendotp, getIncrement, getDecrement, getUserProfile, postAddUserAddress, postCheckout, getOrderHistory, getPaymentURL, getViewOrder, postEditUserProfile, postEditUserAddress, getDeleteUserAddress } = require("../controller/userController")
const verifyUser = require("../middleware/verifyUser")
const router = express.Router()

router.get('/', getUserHome)
router.get('/products', getProducts)
router.get('/login', getUserLogin)
router.get('/signup', getUserSignup)
router.post('/sendOtp', postSendOtp)
router.post('/register', postRegister)
router.post('/login', postUserLogin)
router.post('/searchProduct', postProductSearch)
router.get('/viewProduct/:id', getAdminViewProduct)
router.get('/addToCart/:id',verifyUser, getAddToCart)
router.get('/getCart', verifyUser, getCart)
router.get('/checkout', verifyUser, getCheckout)
router.post('/checkout', verifyUser, postCheckout)
router.get('/UserLogout', verifyUser, getUserLogout)
router.get('/DeleteCart/:id', verifyUser, getDeleteCart)
router.get('/quantityUpdate/:proId', verifyUser, getUserQuantityUpdate)
router.get('/increment/:proId', verifyUser, getIncrement)
router.get('/decrement/:proId', verifyUser, getDecrement)
router.get('/userProfile', verifyUser, getUserProfile)
router.post('/addUserAddress', verifyUser, postAddUserAddress)
router.get('/orderHistory', verifyUser, getOrderHistory)
router.get('/return', verifyUser, getPaymentURL)
router.get('/viewOrder/:id', verifyUser, getViewOrder)
router.post('/editUserProfile', verifyUser, postEditUserProfile)
router.post('/editUserAddress', verifyUser, postEditUserAddress)
router.get('/deleteAddress/:id', verifyUser, getDeleteUserAddress)









module.exports = router