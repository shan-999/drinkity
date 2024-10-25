const categorySchema = require('../../model/category');
const userSchema = require('../../model/userModel')
const bcrypt = require('bcrypt')


const loadPersonlaInfo = async (req,res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const user = await userSchema.findOne(req.session.userId)
        
        res.render('user/personal-info',{categories,user,activePage: 'Personal-info'})


    } catch (error) {
        console.log(`errore in loadPersonlInfo ${error}`);
    }
}


// to change username
const changeUserName = async (req,res)=>{
    const {userName} = req.body
    const userId = req.session.userId
    
    try {

        const user = await userSchema.findById({_id:userId})

        if(!user) return res.status(400).json({success:false})

        await userSchema.findByIdAndUpdate({_id:userId },{$set:{userName}})

        res.status(200).json({success:true})
        
    } catch (error) {
        console.log(`errore in edit profile info ${error}`);
        res.status(500).json({success:true})
    }
}



//to change password
const changePassword = async (req,res) => {
    try {
        const {password,cpassword,currentPassword} = req.body

        const userId = req.session.userId

        const user = await userSchema.findById({_id:userId})

        console.log("Current Password:", currentPassword);
        console.log("Stored User Password:", user.password);

        if(!user) return res.status(400).json({success:false, message: 'User not found'})

        const isMatch = await bcrypt.compare(currentPassword,user.password)
        
        if(!isMatch) return res.status(400).json({success:false , message: 'Current password is incorrect'})

        if(password != cpassword) return res.status(400).json({success:false , message: 'New passwords do not match'})

        const hashedPassword = await bcrypt.hash(password, 10);

        await userSchema.findByIdAndUpdate({_id:userId},{$set:{password:hashedPassword}})

        res.status(200).json({success:true , message: 'Password changed successfully'})
        
    } catch (error) {
        console.log(`errore in change password ${error}`);
    }
}


module.exports = {
    loadPersonlaInfo,
    changeUserName,
    changePassword
}