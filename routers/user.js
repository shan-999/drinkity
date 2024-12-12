const express = require('express');
const router = express.Router();
const userController = require('../controller/user/userController');
const auth = require('../middleware/userAuth');
const userHome = require('../controller/user/userHome')
const accountOrders = require('../controller/user/account-orders')
const accountAddress = require('../controller/user/account-address')
const accountPersonlaInfo = require('../controller/user/account-personal-info');
const cart  = require('../controller/user/cart');
const orderConfirme = require('../controller/user/confirm-order');
const accountWallet = require('../controller/user/wallet')



router.get('/login', auth.isLogin, userController.loadLogin)
router.post('/login',userController.login)


router.post('/google-signup',auth.isLogin,userController.googelSingin)


router.get('/register', auth.isLogin, userController.loadRegister);
router.post('/register', userController.registerUser);
router.get('/otp',auth.isLogin,userController.loadotp);
router.post('/otp', auth.isLogin,userController.verifyOtp);
router.get('/resend',auth.isLogin,userController.resendOtp);


router.get('/forgot-password',auth.isLogin,userController.loadForgetPassword)
router.post('/forgot-password',auth.isLogin,userController.forgotPassword)
router.get('/otp-password',auth.isLogin,userController.loadOTPPassword)
router.post('/otp-verify-password',auth.isLogin,userController.verifyOtpForPassword)
router.get('/change-password',auth.isLogin,userController.loadPasswordChange)
router.post('/change-password',auth.isLogin,userController.changePassword)
router.get('/password-reseted',auth.isLogin,userController.passwordReseted)   


router.get('/search-proudct',userHome.loadSearch)
router.post('/search-product',userHome.search)
router.post('/filter-search',userHome.filterSearch)
router.get('/home', userHome.loadHome);
router.get('/product-details/:id',userHome.LoadProductDetails)


router.get('/category/:categoryName',userHome.loadCategory)
router.post('/filter-category',userHome.filterCategory)




router.get('/account-orders',auth.isAuthenticated,accountOrders.loadAccountOrders)
router.get('/order-details/:orderId',auth.isAuthenticated,accountOrders.laodOrderDetais)
router.post('/cancel-order',auth.isAuthenticated,accountOrders.cancelOrder)
router.post('/return-order',auth.isAuthenticated,accountOrders.returnOrder)
router.post('/invoice-dowload',auth.isAuthenticated,accountOrders.downloadInvoice)



router.get('/account-address',auth.isAuthenticated,accountAddress.loadAddress)
router.get('/add-address',auth.isAuthenticated,accountAddress.loadAddAddress)
router.post('/add-address',auth.isAuthenticated,accountAddress.addAddress)
router.get('/edit-address/:addressId',auth.isAuthenticated,accountAddress.loadEditAddress)
router.post('/edit-address/:addressId',auth.isAuthenticated,accountAddress.editAddress)
router.delete('/delete-Address/:id',auth.isAuthenticated,accountAddress.deleteAddress)



router.get('/account-personal-info',auth.isAuthenticated,accountPersonlaInfo.loadPersonlaInfo)
router.patch('/edit-info',auth.isAuthenticated,accountPersonlaInfo.changeUserName)
router.patch('/edit-password',auth.isAuthenticated,accountPersonlaInfo.changePassword)


router.get('/account-wallet',auth.isAuthenticated,accountWallet.laodWallet)

router.get('/terms-and-contion',auth.isAuthenticated,accountOrders.laodTermsAdnContion)


router.get('/cart',auth.isAuthenticated,cart.loadCart)
router.post('/addtocart',cart.addToCart)
router.delete('/cart/remove-item',auth.isAuthenticated,cart.removeItem)
router.post('/edit-cart',auth.isAuthenticated,cart.editCart)

router.get('/wish-list',auth.isAuthenticated,cart.loadWishList)
router.post('/add-to-wishlist',auth.isAuthenticated,cart.addToWishList)
router.delete('/wishlist/remove-Item',auth.isAuthenticated,cart.removeWishListItem)


router.get('/checkout',auth.isAuthenticated,orderConfirme.checkout)
router.get('/select-addesses/:id',auth.isAuthenticated,orderConfirme.selectedAddress)
router.post('/confirm-order',auth.isAuthenticated,orderConfirme.confirmOrder)
router.get('/order-confirmed/:orderId',auth.isAuthenticated,orderConfirme.loadOrderConfirmed)

router.post('/create-razourpay-order',auth.isAuthenticated,orderConfirme.createRazourPayOrder)
router.post('/verify-payment',auth.isAuthenticated,orderConfirme.verifyPayment)
router.post('/retry-payment',auth.isAuthenticated,orderConfirme.retryPayment)

router.post('/apply-coupon',auth.isAuthenticated,cart.applyCoupen)
router.post('/remove-coupon',auth.isAuthenticated,cart.removeCoupen)




router.post('/logout',userController.logout)






module.exports  = router