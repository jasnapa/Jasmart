// function verifyUser(req,res,next){
//     if(req.session.user){
//         next()
//     }
//     else{
//         res.redirect('/login')
//     }
// }

// module.exports=verifyUser
const userModel = require("../model/userModel");

const verifyUser = async (req, res, next) => {

    if (req.session.user) {
        const user = await userModel.findOne({ _id: req.session.user_id, block: false }, { password: 0 })

        if (user) {
            next();
        } else {
            req.session = null;
            res.render('login',{Blocked: true})
        }
    }
    else {
        res.redirect('/login')
    }

}

module.exports = verifyUser