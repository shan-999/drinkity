const isLogin = (req,res,next) => {

    
    if(req.session.adminId){
        res.redirect('/admin/dashboard')
        console.log(req.session.adminId)
    }else{
        next()
    }
}

const checkSession = (req,res,next) => {
    if(req.session.adminId){
        next()
    }else{
        res.redirect('/admin/login')
    }
}

module.exports = {checkSession,isLogin}