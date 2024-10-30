const categorySchema = require('../../model/category')
const orderSchema = require('../../model/order')
const userSchema = require('../../model/userModel')
const productsSchema = require('../../model/products');
const products = require('../../model/products');


const loadAccountOrders = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const order = await orderSchema.find({ userId: req.session.userId });
        const user = await userSchema.findOne(req.session.userId)

        console.log(order);
        

        

        res.render('user/account-orders', { categories, order ,user , activePage: 'order' }); 
    } catch (err) {
        console.log(`this is from load order: ${err}`)
    }
};


const laodOrderDetais = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const categories = await categorySchema.find({ listed: true });

        const order = await orderSchema.findById(orderId).populate("products"); 

        if (!order) {
            return res.status(404).send("Order not found");
        }
        
        res.render("user/order-details", { order ,categories}); 
    } catch (err) {
        console.log(`This is from load order details: ${err}`);
        res.status(500).send("Server error");
    }
};


const cancelOrder = async (req,res) => {
    const { orderId } = req.body;
    console.log(orderId);
    
    try {

        const order = await orderSchema.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'Cancelled'; 
        order.canceledBy = 'user'
        await order.save();

        const productId = order.products.map(product => product.productId)
        const productQuantity = order.products.map(product => product.quantity)

        for(i = 0 ; i < productId.length ; i++ ){
            const id = productId[i]
            const quantity = productQuantity[i]

            await productsSchema.findOneAndUpdate(id,{
                $inc:{quantity:quantity}
            })
            
        }

        res.status(200).json({ message: 'Order cancelled successfully!' });


    } catch (error) {
        console.log(`This is from cancel order: ${error}`);
    }
}




module.exports = {
    loadAccountOrders,
    laodOrderDetais,
    cancelOrder
}