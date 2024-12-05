const mongoose = require('mongoose')
const order = require('./order')
const walletSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'users',required: true},
    balance:{type:Number,required:true},
    transactions:[
        {
            trascationDate:{type:Date,required:true},
            trascationType:{type: String,enum: ['Credit', 'Debit'], required: true,},
            description: { type: String,required:true},
            amount:{type:Number,required:true}
        }
    ]
},{timestamps: true})

module.exports = mongoose.model('wallet',walletSchema)  