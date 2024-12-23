const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    offName:{type:String,required:true},
    type:{type:String,enum:['fixed','percentage']},
    offValue:{type:Number,required:true},
    valiedTo:{type:Date,required:true},
    valideFrom:{type:Date,required:true},
    offType:{type:String,enum:['category','product'],required:true},
    applicableFor:{type:mongoose.Schema.Types.ObjectId, refPath:'offType', required:true},
    isActive:{type:String,enum:['Valied','Expierd'],default:'Valied'},
})


module.exports = mongoose.model('offers',offerSchema)