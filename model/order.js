const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    productName:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        default:true
    },
    quantity:{
        type:Number,
        default:true
    },
    orderDate:{
        type:Date,
        default:true
    },
    image:{
        type:[String],
        default:true
    }
})

module.exports = mongoose.model('Order',orderSchema)