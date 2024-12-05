const mongoose = require('mongoose')


const couponSchema = new mongoose.Schema({
    code:{type:String,required:true},
    type:{type:String,enum:['fixed','percentage'],required:true},
    value:{type:Number,required:true},
    valideFrom:{type:Date,required:true},
    validTo:{type:Date,required:true},
    usageLimit:{type:Number,required:true},
    minValue:{type:Number,required:true},
    usedBy:{type:[String]},
    status:{type:String,enum:['Expired','Valied'],default:'Valied'}
})

module.exports = mongoose.model('coupon',couponSchema)