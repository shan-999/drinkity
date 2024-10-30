const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'users',required: true},
    customer: {
        userName: { type: String, required: true },
        email: { type: String, required: true },
        address: {
            landMark: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            phonNumber: { type: String, required: true } 
        }
    },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true }, 
        image: { type: String, required: true }, 
    }],
    Totalprice: {
        type: Number,
        required: true 
    },
    paymentMethourd: {
        type: String,
        required: true 
    },
    orderDate: {
        type: Date,
        default: Date.now     },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    canceledBy: { type: String, enum: ['user', 'admin', null] }
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);