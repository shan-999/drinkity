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
        
        const shippingFee = order.Totalprice > 500 ? 0 : 60

        const estimatedTotal = Number(order.Totalprice) + shippingFee

        const subTotal = order.products.reduce((acc,item) => acc + item.total ,0)
        console.log(subTotal);
        
        

        res.render("user/order-details", { order ,categories, estimatedTotal ,subTotal}); 
    } catch (err) {
        console.log(`This is from load order details: ${err}`);
        res.status(500).send("Server error");
    }
};


const cancelOrder = async (req,res) => {
    const {orderId} = req.body

    try {
        const order = await orderSchema.findById(orderId)
        if(!order){
            return res.status(400).json({message:'order not fount'})
        }

        order.status = 'Cancelled'
        order.canceledBy = 'user'
        await order.save()

        for(let product of order.products){
            await productsSchema.updateOne({_id:product.productId},{
                $inc:{quantity:product.quantity}
            })
        }

        res.status(200).json('')

    } catch (error) {
        console.log('this is from cancel order',error);
    }
}


module.exports = {
    loadAccountOrders,
    laodOrderDetais,
    cancelOrder
}