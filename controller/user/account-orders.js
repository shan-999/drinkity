const categorySchema = require('../../model/category')
const orderSchema = require('../../model/order')
const userSchema = require('../../model/userModel')


const loadAccountOrders = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const order = await orderSchema.find(); 
        const user = await userSchema.findOne(req.session.userId)

        

        res.render('user/account-orders', { categories, order ,user , activePage: 'order' }); 
    } catch (err) {
        console.log(`this is from load order: ${err}`)
    }
};




module.exports = {
    loadAccountOrders
}