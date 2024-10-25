const adminSchema = require('../../model/adminModel')
const bcrypt = require('bcrypt')



const loadLogin = async (req,res) => {
    const message = req.query.message
    console.log(message);
    res.render('admin/login',{msg:message})
}

const loadDashboard = async (req,res) => {
    res.render('admin/dashboard')
}

const login = async (req,res) => {
    const {email,password} = req.body
    console.log(`thsi is from body:${email} , ${password}`);
    
    const admin = await adminSchema.findOne({email})
    console.log(`this is from db :${admin}`);
    
    if(!admin) return res.redirect(`/admin/login?message=user not found`)
    
        
    const isMatch = await bcrypt.compare(password,admin.password)
    
    if(!isMatch) return res.redirect('/admin/login?message=Password not match')
    
    
    req.session.adminId = admin._id
    res.redirect('/admin/dashboard')
}



const logout = (req, res) => {
    req.session.destroy() 
    res.redirect('/admin/login'); 
};



module.exports = {
    loadLogin,
    login,
    loadDashboard,
    logout
}