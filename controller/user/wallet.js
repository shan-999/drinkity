const walletSchema = require('../../model/wallet')
const categorySchema = require('../../model/category')
const userSchema = require('../../model/userModel')

const laodWallet = async (req,res,) => {

    const  userId = req.session.userId
    
    const wallet = await walletSchema.findOne({userId}).sort()
    const categories = await categorySchema.find({})
    const user = await userSchema.findById(userId)


    res.render('user/wallet',{wallet,activePage:'Wallet',categories,user})
}




module.exports = {laodWallet}