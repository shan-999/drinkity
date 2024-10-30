const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fullName: {
        type: String, 
        required: true,
    },address: {
        type: String,
        required: true,
    },
    landmark:{
        type:String,
        require:true
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    PINCode: {
        type: String,
        required: true,
    },
    phonNumber: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true
    }
},{timestamps:true});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
