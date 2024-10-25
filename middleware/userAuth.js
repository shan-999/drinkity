const userModel = require('../model/userModel')


const isLogin = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/home');
    } else {
        next();
    }
};

const isAuthenticated = async (req, res, next) => {

    const user = await userModel.findById(req.session.userId)
    if (req.session.userId && user.isBlocked === false) {
        next()
    } else {
        res.redirect('/login'); 
    }
};

module.exports = { isLogin, isAuthenticated };
