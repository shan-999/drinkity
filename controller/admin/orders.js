const orderSchema = require('../../model/order');
const productsSchema = require('../../model/products');

const loadOrder = async (req, res) => {
    try {
        const orders = await orderSchema.find().populate('userId').exec();
        res.render('admin/orders', { orders });
    } catch (error) {
        console.log('Error in loadOrder: ' + error);
        res.status(500).send('An error occurred while loading orders.');
    }
};


const updateStats = async (req,res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        console.log(orderId,status);
        

        const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await orderSchema.findByIdAndUpdate(orderId, { status }, { new: true });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }


        if (status === 'Cancelled') {
            order.canceledBy = 'admin';
        }        
        
        res.status(200).json({ message: 'Order status updated successfully', order });

    } catch (error) {
        console.log('Error in loadOrder: ' + error);
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