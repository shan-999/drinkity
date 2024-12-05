const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    listed:{
        type:Boolean,
        default:true
    },
    offer:{
        offerApplied:{type:Boolean,default:false},
        offerId:[{type: mongoose.Schema.Types.ObjectId, ref: 'offers'}]
    }
})

module.exports = mongoose.model('category',categorySchema)