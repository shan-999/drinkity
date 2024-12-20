const mongoose = require('mongoose');
const coupon = require('./coupon');
const { strike } = require('pdfkit');

const orderSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'users',required: true},
    address: {
        landMark: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        phonNumber: { type: String, required: true } 
    },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true }, 
        image: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled' , 'Returned'], default: 'Pending' },
        requst:
            {
                requastName:{type:String},
                reason:{type:String},
                approve:{type:Boolean}
            }
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
        default: Date.now     
    },
    coupenApplied:{
        applied:{type:Boolean,default:false},
        discount:{type:Number,default:0}
    },
    totalOfferPrice:{type:Number,default:0},
    PaymentStatus:{type:String,enum:['Pending','Failed','Success','Refund'],default:'Pending'}

},{ timestamps: true });


module.exports = mongoose.model('Order', orderSchema);