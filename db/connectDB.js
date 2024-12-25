const mongoose = require('mongoose')


const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        // const conn = await mongoose.connect('mongodb://127.0.0.1:27017')
        console.log(`mongodb conneted success:${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

module.exports = connectDB