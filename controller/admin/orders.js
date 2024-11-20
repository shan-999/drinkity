const orderSchema = require('../../model/order');
const productsSchema = require('../../model/products');

const loadOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 4; 
        const skip = (page - 1) * limit;

        const orders = await orderSchema.find().populate('userId').skip(skip).limit(limit).exec();

        const totalProducts = await orderSchema.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/orders', { orders ,page , totalPages});
    } catch (error) {
        console.log('Error in loadOrder: ' + error);
        res.status(500).send('An error occurred while loading orders.');
    }
};


const updateStats = async (req,res) => {
    try {
        const { orderId } = req.params;
        const { status,productId } = req.body;
        
        const order = await orderSchema.findById(orderId)
        
        
        const productIndex = order.products.findIndex(item => item.productId.toString() === productId)
        
        order.products[productIndex].status = status

        await order.save()
        
        res.status(200).json({ message: 'Order status updated successfully', });

    } catch (error) {
        console.log('Error in update order: ' , error);
        res.status(500).send('An error occurred while loading orders.');
    }
}




const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId; 
        const order = await orderSchema.findById(orderId).populate('customer').populate('products');
        
        if (!order) {
            return res.status(404).send("Order not found");
        }
        
        res.render('admin/order-details', { order });
    } catch (error) {
        console.log('Error in loadOrderDetails:', error);
        res.status(500).send("Server Error");
    }
};





module.exports = {
    loadOrder,
    updateStats,
    loadOrderDetails
}