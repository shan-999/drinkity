const express = require('express')
const router = express.Router()
const adminController = require('../controller/admin/adminController')
const adminAth = require('../middleware/adminAuth')
const adminUsers = require('../controller/admin/adminUser')
const adminProducts = require('../controller/admin/adminProduct')
const adminCategory = require('../controller/admin/category')


router.get('/login',adminAth.isLogin,adminController.loadLogin)
router.post('/login',adminController.login)

router.get('/logout', adminController.logout);

router.get('/dashboard',adminAth.checkSession,adminController.loadDashboard)

router.get('/users',adminAth.checkSession,adminUsers.loadusers)
router.post('/users/:action',adminAth.checkSession,adminUsers.userStatus);




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

module.exports  = router