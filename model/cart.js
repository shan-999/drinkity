const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    items: [{
        productId: {
            type: Schema.Types.ObjectId,  
            ref: 'product',
            required: true
        },
        quantity:{
            type: Number,
            default :1
        },
        totalPrice:{
            type: Number,
            default :0
        },
        price:{
            type:Number,
            required:true
        }
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cartTotalPrice:{
        type: Number,
        required:true
    }
});

module.exports = mongoose.model('Cart', cartSchema);
