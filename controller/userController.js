const userModel = require("../model/userModel");
const userRouter = require("../router/userRouter");
const { sendOTP } = require('../helper/sendOTP');
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel");
const orderModel = require("../model/orderModel");
const axios = require('axios');
const couponModel = require("../model/couponModel");


let OTP = Math.floor(Math.random() * 1000000);
let CheckOTP
let userDetails

var userController = {

    getUserLogin: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('login')
        }
    },
    getUserHome: async (req, res) => {
        try {
            const user = await userModel.findOne({ _id: req.session.user_id, block: false }, { password: 0 })
            if (user) {
                const Log = req.session.user_name
                let banner = await bannerModel.find({})
                res.render('userHome', { Log, banner })
            } else {
                req.session = null;
                let banner = await bannerModel.find({})
                res.render('userHome', { banner })
            }
        } catch (err) {
            console.log(err);
        }

    },

    postUserLogin: async (req, res) => {
        try {
            const { email, password } = req.body
            let user = await userModel.findOne({ email })
            console.log(user);
            if (user) {
                if (user.block) {
                    res.render('login', { Blocked: true })
                }
                else if (user.email == email && user.password == password) {
                    req.session.user_name = user.name;
                    req.session.user = user.email;
                    req.session.user_id = user._id
                    res.redirect('/')
                } else {
                    res.render('login', { wrong: true })
                }
            } else {
                res.render('login', { error: true })
            }
        } catch (err) {
            console.log(err);

        }
    },

    getUserSignup: (req, res) => {
        res.render('signup')
    },

    postSendOtp: async (req, res) => {
        try {
            const { name, password } = req.body
            let user = await userModel.findOne({ email: req.body.email })
            console.log(user);
            if (user) {
                res.render('signup', { Duplicate: true })
            }
            if (name.trim() == "" || password.trim() == "") {
                console.log('fjddjfdjh');
                res.render('signup', { err: true })
            } else {
                const { password, Cpassword } = req.body
                if (password == Cpassword) {

                    userDetails = req.body
                    sendOTP(req.body.email, OTP)
                    CheckOTP = OTP
                    console.log(CheckOTP)
                    res.render('otp')

                } else {
                    res.render('signup', { mismatch: true })
                }

            }
        } catch (error) {
            console.log(error)
        }

    },



    // resendotp: (req, res) => {
    //     try {
    //       console.log("resended Otp");
    //       let otp = Math.floor(Math.random() * 1000000);
    //       req.session.signupOTP = otp;
    //       console.log(otp);
    //       sentOTP(req.session.signupEmail, otp);
    //       res.render("otp");
    //     } catch (error) {
    //       console.log(error);
    //       res.render("otp", {
    //         error: true,
    //         message: "Something went wrong. Please try again later.",
    //       });
    //     }
    //   },
    postRegister: (req, res) => {
        try {
            if (CheckOTP == req.body.otp) {
                console.log("sucess");
                let user = new userModel({ ...userDetails })
                user.save()
                res.redirect('/login')
            } else {
                res.render('otp')
                console.log('erro');
            }

        } catch (error) {
            console.log(error)
        }
    },
    getProducts: async (req, res) => {
        try {
            const user = await userModel.findOne({ _id: req.session.user_id, block: false }, { password: 0 })
            req.session.pageNum = parseInt(req.query.page ?? 1);
            req.session.perpage = 4;
            let Category = req.query.category
            let sort = req.query.sort
            if (sort) {
                req.session.sort = sort;
            }
            console.log(Category);
            let products
            if (Category && req.session.sort == 'low') {
                products = await productModel
                    .find({ category: Category })
                    .countDocuments()
                    .then((documentCount) => {
                        docCount = documentCount;
                        return productModel
                            .find({ category: Category })
                            .sort({ price: 1 })
                            .skip((req.session.pageNum - 1) * req.session.perpage)
                            .limit(req.session.perpage)
                            .lean()
                    });
            }
            else if (Category && req.session.sort == 'high') {
                products = await productModel
                    .find({ category: Category })
                    .countDocuments()
                    .then((documentCount) => {
                        docCount = documentCount;
                        return productModel
                            .find({ category: Category })
                            .sort({ price: -1 })
                            .skip((req.session.pageNum - 1) * req.session.perpage)
                            .limit(req.session.perpage)
                            .lean()
                    });
            }
            else if (Category && req.session.sort == 'AZ') {
                products = await productModel
                    .find({ category: Category })
                    .countDocuments()
                    .then((documentCount) => {
                        docCount = documentCount;
                        return productModel
                            .find({ category: Category })
                            .sort({ name: 1 })
                            .skip((req.session.pageNum - 1) * req.session.perpage)
                            .limit(req.session.perpage)
                            .lean()
                    });
            }
            else if (Category) {
                console.log("only");
                products = await productModel
                    .find({ category: Category })
                    .countDocuments()
                    .then((documentCount) => {
                        docCount = documentCount;
                        return productModel
                            .find({ category: Category })
                            .skip((req.session.pageNum - 1) * req.session.perpage)
                            .limit(req.session.perpage)
                            .lean()
                    });
            } else {
                console.log("only else");
                products = await productModel
                    .find()
                    .countDocuments()
                    .then((documentCount) => {
                        docCount = documentCount;
                        return productModel
                            .find()
                            .skip((req.session.pageNum - 1) * req.session.perpage)
                            .limit(req.session.perpage)
                            .lean();
                    });
            }



            username = req.session.user;
            console.log(docCount);
            let pageCount = Math.ceil(docCount / req.session.perpage);
            console.log(pageCount);
            let pagination = [];
            for (i = 1; i <= pageCount; i++) {
                pagination.push(i);
            }
            const Log = req.session.user_name
            res.render('productList', { products, Log, sort, Category, pagination })
        } catch (err) {
            console.log(err);

        }
    },
    postProductSearch: async (req, res) => {
        try {
            const [category, sub] = await Promise.all([
                productModel.find({ block: false }).lean(),
                categoryModel.find({ block: false }).lean()

            ]);

            if (req.body.Search) {
                const products = await productModel.find({
                    $and: [
                        { status: 'true' },
                        {
                            $or: [
                                { name: new RegExp(req.body.Search, 'i') },
                                { category: new RegExp(req.body.Search, 'i') }
                            ]
                        }
                    ]
                }).lean();
                res.render('productList', { products, category, sub });
            } else {

                res.render('productList', { category, sub });
            }

        } catch (err) {
            console.log('Error:', err);
        }
    },
    getAdminViewProduct: async (req, res) => {
        try {
            let _id = req.params.id
            const product = await productModel.findById({ _id }).lean()
            const Log = req.session.user_name
            res.render('productView', { product, Log })
        } catch (err) {
            console.log(err);

        }
    },
    getAddToCart: async (req, res) => {
        try {
            let _id = req.params.id
            await userModel.updateOne({ _id: req.session.user_id }, { $addToSet: { cart: { product_id: _id, quantity: 1 } } })
            res.redirect('back')
        } catch (err) {
            console.log(err);

        }
    },

    getCart: async (req, res) => {
        try {
            const Log = req.session.user_name
            const { cart } = await userModel.findOne({ _id: req.session.user_id }, { cart: 1 })
            if (cart.length == 0) {
                res.render('emptyCart', { Log })
            }
            let cartQuantity = {}

            const cartItems = cart.map(item => {
                cartQuantity[item.product_id] = item.quantity
                return item.product_id
            })

            let cartData = await productModel.find({ _id: { $in: cartItems } }).lean()
            let products = cartData.map((item, index) => {
                return { ...item, quantity: cartQuantity[item._id], totalPrice: cartQuantity[item._id] * item.price }
            })
            req.session.cartItems = products

            let TotalAmount = 0
            products.forEach((item, index) => {
                TotalAmount = (TotalAmount + (item.price * item.quantity))
                req.session.TotalAmount = TotalAmount
            })
            let Code
            let minus
            let Result
            let Invalid
            let Reject
            let code = req.query.coupon
            if (code) {
                let coupon = await couponModel.findOne({ code: code })
                if (coupon) {
                    if (TotalAmount >= coupon.minamount && TotalAmount <= coupon.maxamount) {
                        let expiry = coupon.expiry
                        Code = coupon.code
                        minus = coupon.cashback
                        TotalAmount = TotalAmount - minus
                        Result = TotalAmount
                        req.session.coupon = coupon
                        req.session.TotalAmount = TotalAmount
                    } else {
                        Reject = true
                    }

                }
                else {
                    Invalid = true
                }
            }
            res.render('addToCart', { products, Log, TotalAmount, Result, Invalid, minus, Code, Reject })
        } catch (err) {
            console.log(err);

        }
    },

    getUserLogout: (req, res) => {
        req.session.destroy()
        res.render('userHome')
    },
    getDeleteCart: async (req, res) => {
        try {
            let proId = req.params.id
            let _id = req.session.user_id


            console.log(proId);
            console.log(_id);

            await userModel.updateOne({ _id }, { $pull: { cart: { product_id: proId } } }, { multi: true }).then(() => {
                console.log('deleted succesfully')
                res.redirect('back')
            }).catch(err => {
                res.json(err)
                console.log(err)
            })
        } catch (err) {
            console.log(err);

        }
    },
    getUserQuantityUpdate: async (req, res) => {
        try {
            let _id = req.session.user_id
            let Action = req.query.Add
            if (Action == "plus") {
                await userModel.updateOne({ _id: _id, cart: { $elemMatch: { product_id: req.params.proId } } }, { $inc: { 'cart.$.quantity': 1 } })
                res.json({ plus: true })
            } else {
                res.json({ minus: true })

                await userModel.updateOne({ _id: _id, cart: { $elemMatch: { product_id: req.params.proId } } }, { $inc: { 'cart.$.quantity': -1 } })
            }
        } catch (err) {
            console.log(err);
        }
    },
    getIncrement: async (req, res) => {
        try {
            let userid = req.session.user_id;
            const pid = req.params.proId;
            const product = await productModel.findById(pid);
            const stockValue = product.stock;
            const user = await userModel.findById(userid);
            const cartItem = user.cart.find((item) => item.id === req.params.id);
            let qty = cartItem.quantity;
            if (stockValue <= qty) {
                res.json({ success: false, stockValue, qty });
                console.log(stockValue, qty);
            } else {
                await userModel.updateOne({ _id: req.session.user_id, cart: { $elemMatch: { product_id: req.params.proId } } }, { $inc: { "cart.$.quantity": 1 } })
                res.json({ success: true, stockValue, qty });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Something went wrong" });
        }
    },

    getDecrement: async (req, res) => {
        try {
            let { cart } = await userModel.findOne({ _id: req.session.user_id, "cart.product_id": req.params.proId },
                { _id: 0, cart: { $elemMatch: { product_id: req.params.proId } } }
            );
            if (cart[0].quantity <= 1) {
                const pid = req.params.id;
                await userModel.updateOne(
                    { _id: req.session.user_id },
                    { $pull: { cart: { product_id: req.params.proId } } }
                );
                res.json({ remove: true });
            } else {
                await userModel.updateOne(
                    {
                        _id: req.session.user_id,
                        cart: { $elemMatch: { product_id: req.params.proId } },
                    },
                    {
                        $inc: {
                            "cart.$.quantity": -1,
                        },
                    }
                );
                res.json({ success: true });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error" });
        }

    },
    getUserProfile: async (req, res) => {
        try {
            const Log = req.session.user_name
            let userid = req.session.user_id;
            let profile = await userModel.findById(userid)
            let address = profile.address
            res.render('userProfile', { profile, address, Log })
        } catch (err) {
            console.log(error)
        }
    },

    postAddUserAddress: async (req, res) => {
        try {
            _id = req.session.user_id
            console.log(_id);
            const form = req.body
            form.id = Date.now()
            await userModel.updateOne({ _id }, { $addToSet: { address: form } })
            console.log('success');
            res.redirect('back')
        } catch (err) {
            console.log(err);
        }

    },
    getCheckout: async (req, res) => {
        try {
            const Log = req.session.user_name
            const _id = req.session.user_id
            const aid = req.query._id
            let Eaddress
            if (aid) {
                const { address } = await userModel.findOne({ _id }, { address: 1 })
                Eaddress = address.find(e => e.id == aid)
            }
            const { cart } = await userModel.findOne({ _id }, { cart: 1 })
            console.log(cart);
            const { address } = await userModel.findOne({ _id }, { address: 1 })
            let cartQuantity = {}

            const cartItems = cart.map(item => {
                cartQuantity[item.product_id] = item.quantity
                return item.product_id
            })

            let cartData = await productModel.find({ _id: { $in: cartItems } }).lean()
            let products = cartData.map((item, index) => {
                return { ...item, quantity: cartQuantity[item._id], totalPrice: cartQuantity[item._id] * item.price }
            })
            let TotalAmount = req.session.TotalAmount
            console.log(products);
            res.render('checkOut', { TotalAmount, Log, products, address, Eaddress })
        } catch (err) {
            console.log(err);
        }
    },
    postCheckout: async (req, res) => {
        try {
            let _id = req.session.user_id
            const address = req.body
            console.log(address);
            let products = req.session.cartItems
            const { cart } = await userModel.findOne({ _id }, { cart: 1 })
            const Log = req.session.user_name
            let orders = []
            let i = 0
            let orderid = Date.now()
            for (let item of products) {
                orders.push({
                    orderId: orderid,
                    address: address,
                    product: item,
                    orderDate: new Date().toLocaleString(),
                    userId: _id,
                    quantity: cart[i].quantity,
                    total: req.session.TotalAmount,
                    payment: req.body.paymentMethod
                })
            }
            // await userModel.findByIdAndUpdate({ _id }, { $set: { cart: [] } })
            // res.render('orderSuccess', { Log })
            req.session.orders = orders
            req.session.orderId = orderid
            let paymentMode = req.body.paymentMethod
            if (paymentMode != 'COD') {
                let TotalAmount = req.session.TotalAmount
                let orderId = "order_" + orderid;
                const options = {
                    method: "POST",
                    url: "https://sandbox.cashfree.com/pg/orders",
                    headers: {
                        accept: "application/json",
                        "x-api-version": "2022-09-01",
                        "x-client-id": '33168045e548176a9070ae7415086133',
                        "x-client-secret": 'bd51dbf947a404db202834c39ba10cb6f38cbdf9',
                        "content-type": "application/json",
                    },
                    data: {
                        order_id: orderId,
                        order_amount: TotalAmount,
                        order_currency: "INR",
                        customer_details: {
                            customer_id: _id,
                            customer_email: 'jasna123@gmail.com',
                            customer_phone: '9946953906',
                        },
                        order_meta: {
                            return_url: "http://localhost:2000/return?order_id={order_id}",
                        },
                    },
                };

                await axios
                    .request(options)
                    .then(function (response) {

                        return res.render("paymentTemp", {
                            orderId,
                            sessionId: response.data.payment_session_id,
                        });
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            } else {
                await orderModel.create(orders)
                const Log = req.session.user_name

                await userModel.findByIdAndUpdate({ _id }, { $set: { cart: [] } })
                res.render('orderSuccess', { Log })
            }
            //Payment
        } catch (error) {
            console.log(error);
        }
    },
    getPaymentURL: async (req, res) => {
        try {
            const order_id = req.query.order_id;
            const options = {
                method: "GET",
                url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
                headers: {
                    accept: "application/json",
                    "x-api-version": "2022-09-01",
                    "x-client-id": '33168045e548176a9070ae7415086133',
                    "x-client-secret": 'bd51dbf947a404db202834c39ba10cb6f38cbdf9',
                    "content-type": "application/json",
                },
            };

            const response = await axios.request(options);


            if (response.data.order_status == "PAID") {

                let _id = req.session.user_id
                const orders = req.session.orders
                console.log(orders);
                await orderModel.create(orders)
                let orderId = req.session.orderId
                const Log = req.session.user_name
                await userModel.findByIdAndUpdate({ _id }, { $set: { cart: [] } })
                await orderModel.updateMany({ orderId }, { $set: { paid: true } })
                console.log('sjfghsjdgfjkshgfgjksfdh');
                res.render('orderSuccess', { Log })
            } else {
                res.render('404 page')
            }


        } catch (err) {
            console.log(err);
            res.redirect('error-page')
        }


    },
    getOrderHistory: async (req, res) => {
        let _id = req.session.user_id
        let order = await orderModel.find({ userId: _id })
        res.render('orderHistory', { order })
    },
    getViewOrder: async (req, res) => {
        const Log = req.session.user_name
        let _id = req.params.id
        let order = await orderModel.findById({ _id })
        console.log(order);
        let products = order.product
        console.log("sdlsdl", products);
        res.render('orderView', { order, products, Log })
    },
    postEditUserProfile: async (req, res) => {

        try {
            _id = req.session.user_id
            const { name, email, mobile } = req.body
            await userModel.findByIdAndUpdate({ _id }, { $set: { name, email, mobile } })
            res.redirect('back')
        } catch (err) {
            console.log(err);
        }

    },
    postEditUserAddress: async (req, res) => {
        try {
            const userId = req.session.user_id;

            const { name, email, address, landmark, country, state, pincode, id } = req.body;

            const result = await userModel.updateOne(
                { _id: userId, "address.id": parseInt(id) },
                {
                    $set: {
                        "address.$.name": name,
                        "address.$.email": email,
                        "address.$.address": address,
                        "address.$.landmark": landmark,
                        "address.$.country": country,
                        "address.$.state": state,
                        "address.$.pincode": pincode
                    }
                }
            );

            res.redirect('back')
        } catch (err) {
            console.log(err);
        }
    },
    getDeleteUserAddress: async (req, res) => {
        try {
            let aid = req.params.id
            const _id = req.session.user_id;
            console.log(aid);
            let result = await userModel.updateOne({ _id: _id }, { $pull: { address: { id: parseInt(aid) } } }, { multi: true })
            console.log(result);
            res.redirect('back')
        } catch (err) {
            console.log(err);

        }
    },
    getUserWishlist: async (req, res) => {
        try {
            _id = req.session.user_id
            const { wishlist } = await userModel.findOne({ _id }, { wishlist: 1 })
            console.log(wishlist);
            const wishItems = wishlist.map((item) => {
                return item
            })
            const Log = req.session.user_name
            const products = await productModel.find({ _id: { $in: wishItems } }).lean()
            res.render('wishlist', { products, Log })
        } catch (err) {
            console.log(err);
        }
    },
    getAddtoWishlist: async (req, res) => {

        try {
            const _id = req.session.user_id
            const proId = req.params.id
            await userModel.updateOne({ _id }, { $addToSet: { wishlist: { _id: proId } } })
            console.log('success');
            res.redirect('back')
        } catch (err) {
            console.log(err);
        }
    },
    getDeleteWish: async (req, res) => {
        try {
            if (req.session.user) {
                proId = req.params.id
                _id = req.session.user_id
                await userModel.updateOne({ _id }, { $pull: { wishlist: { _id: proId } } }, { multi: true }).then(() => {
                    console.log('deleted succesfully')
                    res.redirect('/Wishlist')
                }).catch(err => {
                    res.json(err)
                    console.log(err)
                })
            } else {
                res.render('ErrorCart')
            }
        } catch (err) {
            console.log(err);
        }
    },
    getUserMoveCart: async (req, res) => {
        try {
            _id = req.session.user_id
            proId = req.params.id
            console.log(proId);
            await userModel.updateOne({ _id }, {
                $addToSet: {
                    cart: {
                        product_id: proId, quantity: 1
                    }
                }
            })
            await userModel.updateOne({ _id }, { $pull: { wishlist: { _id: proId } } }, { multi: true })
            res.redirect('back')
        } catch (err) {
            console.log(err);
        }
    },


}


module.exports = userController