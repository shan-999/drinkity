const express = require('express')
const router = express.Router()
const adminController = require('../controller/admin/adminController')
const adminAth = require('../middleware/adminAuth')
const adminUsers = require('../controller/admin/adminUser')
const adminProducts = require('../controller/admin/adminProduct')
const adminCategory = require('../controller/admin/category')
const adminOrders = require('../controller/admin/orders')
const adminCoupon = require('../controller/admin/coupon')
const adminOffers = require('../controller/admin/offers')
const adminSalesReport = require('../controller/admin/sales-report')
const adminDashbord = require('../controller/admin/dashbord')


router.get('/login',adminAth.isLogin,adminController.loadLogin)
router.post('/login',adminController.login)

router.get('/logout', adminController.logout);

router.get('/dashboard',adminAth.checkSession,adminDashbord.loadDashbord)
router.post('/chart',adminAth.checkSession,adminDashbord.loadChart)
router.post('/filter-chart',adminAth.checkSession,adminDashbord.filterChart)

router.get('/users',adminAth.checkSession,adminUsers.loadusers)
router.post('/users/:action',adminAth.checkSession,adminUsers.userStatus);


router.get('/sales-Report',adminAth.checkSession,adminSalesReport.loadSalesReport)
router.post('/filter-sales-report',adminAth.checkSession,adminSalesReport.filterSalesReport)
router.post('/dowload-excel',adminAth.checkSession,adminSalesReport.dowloadExcel)
router.post('/download-pdf',adminAth.checkSession,adminSalesReport.dowloadPDF)



router.get('/products',adminAth.checkSession,adminProducts.loadProducts)
router.get('/add-product',adminAth.checkSession,adminProducts.loadAddProduct)
router.get('/edit-product/:id',adminAth.checkSession,adminProducts.loadEditProduct)

router.post('/add-product',adminAth.checkSession,adminProducts.upload.array('images', 3),adminProducts.addProduct);
router.post('/edit-product/:id', adminAth.checkSession, adminProducts.upload.array('images', 3), adminProducts.editProduct);
router.delete('/delete-product/:id',adminAth.checkSession,adminProducts.deleteProduct)
router.post('/product-status/:action',adminAth.checkSession,adminProducts.editStatus)



router.get('/category',adminAth.checkSession,adminCategory.loadcategory)
router.get('/add-category',adminAth.checkSession,adminCategory.loadAddCategory)
router.get('/edit-category/:_id',adminAth.checkSession,adminCategory.loadEditCategory)

router.post('/add-category',adminAth.checkSession,adminCategory.addCategory)
router.post('/edit-category',adminAth.checkSession,adminCategory.editCategory)
router.post('/delete-category',adminAth.checkSession,adminCategory.deleteCategory)
router.post('/soft-edit-category/:action',adminAth.checkSession,adminCategory.softEditCategory)


router.get('/orders',adminAth.checkSession,adminOrders.loadOrder)
router.post('/orders/:orderId', adminAth.checkSession,adminOrders.updateStats);
router.get('/order-detils/:orderId',adminAth.checkSession,adminOrders.loadOrderDetails)
router.post('/approve-return-requst',adminAth.checkSession,adminOrders.approveReturnRequst)


router.get('/coupon',adminAth.checkSession,adminCoupon.loadCoupon)
router.post('/add-coupon',adminAth.checkSession,adminCoupon.addCoupon)
router.get('/edit-modal/:id',adminAth.checkSession,adminCoupon.loadEditModal)
router.post('/edit-coupon/:id',adminAth.checkSession,adminCoupon.editCoupon)
router.delete('/delete-coupon',adminAth.checkSession,adminCoupon.deleteCoupon)


router.get('/offers',adminAth.checkSession,adminOffers.loadOffers)
router.post('/add-offer',adminAth.checkSession,adminOffers.addOffer)
router.get('/edit-offer/:id',adminAth.checkSession,adminOffers.loadEditoffer)
router.post('/edit-offer/:offerId',adminAth.checkSession,adminOffers.editOffer)
router.delete('/delete-offer',adminAth.checkSession,adminOffers.deleteOffer)




module.exports  = router