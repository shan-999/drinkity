const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    googelSingin:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('users',userSchema)