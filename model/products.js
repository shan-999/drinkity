const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    productName:{
        type:String,
        require:true
    },
    brand:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    ingredients:{
        type:String,
        require:true
    },
    quantity:{
        type:Number,
        require:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        require:true
    },
    description:{
        type:String,
        require:true
    },
    listed:{
        type:Boolean,
        default:true
    },
    images: {
        type: [String],
        require:true
    },
    offer: {
        offerApplied:{type:Boolean,default:false},
        offerId:[{type: mongoose.Schema.Types.ObjectId, ref: 'offers'}]
    }
})


module.exports = mongoose.model('product',productSchema)