const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    listed:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('category',categorySchema)