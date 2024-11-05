const userSchema = require('../../model/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const OTP = require('../../model/otpModel');
const { find } = require('../../model/adminModel');



//login page-------------------------------------------------------
const   loadLogin = async (req, res) => {
    console.log('yes reched here');
    
    try {
        const message = req.query.message
    res.render('user/login',{msg:message}); 
    console.log('render login');
    console.log(req.session.userId);
    } catch (error) {
        
        res.send("not found")
    }
    
    
};



const login = async (req,res) =>{
    try {
        const {email,password} = req.body
        console.log(email,password);
        
        const user = await userSchema.findOne({email})
        if(!user) return res.redirect(`/login?message=user not found`)

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch)return res.redirect(`/login?message=password incorrect`) 

        if(user.isBlocked){
            return res.redirect('login?message=You were blocked by admin')
        }

        req.session.userId = user._id

        res.redirect('/home')
    } catch (error) {
        console.log(`Error from login:${error}`);
        
    }
}




//register-------------------------------------------------------------------------
const loadRegister = async (req, res) => {
    res.render('user/register');
};

const loadotp = async (req, res) => {
    const message = req.query.message
    res.render('user/otp', { msg: message });
};


const registerUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        const user = await userSchema.findOne({ email });
        if (user) return res.redirect('/register'); 


        const hashedPassword = await bcrypt.hash(password, saltRounds);
        

        req.session.tempUser = {
            userName,
            email,
            password: hashedPassword,
        };

        await sendOtp(email);

        req.session.tempUserEmail = email; 
        res.redirect('/otp');
    } catch (error) {
        console.error(`Error during registration: ${error}`);
        console.log(error);
    }
};





const sendOtp = async (email) => {
    let digits = '0123456789';
    let otp = '';
    for (let i = 0; i < 4; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }

    console.log(`Generated OTP: ${otp}`);

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'drinkity999@gmail.com',
            pass: 'nxdp hcus aumy epmb', 
        },
    });

    let mailOptions = {
        from: 'drinkity999@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
    }

    try {
        const exprTime = Date.now() + 1 * 60 * 1000; 
        const otpEntry = new OTP({
            email: email,
            otp: otp,
            exprTime: exprTime,
        });
        await otpEntry.save();
    } catch (error) {
        console.error(`Error saving OTP to database: ${error}`);
    }
};



const verifyOtp = async (req, res) => {
    try {
        const { one, two, three, four } = req.body;
        const otp = one + two + three + four;

        console.log(`Entered OTP: ${otp}`);

        const checkOTP = await OTP.findOne({ otp: otp, email: req.session.tempUserEmail });
        if (!checkOTP) {
            return res.redirect('/otp?message=Invalied otp');
        }

        const currentTime = Date.now();
        const exprTime = checkOTP.exprTime.getTime();

        if (currentTime > exprTime) {
            return res.redirect('/otp?message=OTP expierd');
        }

      
        const tempUser = req.session.tempUser; 
        const newUser = new userSchema({
            userName: tempUser.userName,
            email: tempUser.email,
            password: tempUser.password,
        });

        await newUser.save(); 

        req.session.userId = newUser._id;
        console.log(req.session.userId);
        
        await OTP.deleteOne({ otp: otp, email: req.session.tempUserEmail });
        delete req.session.tempUser;
        delete req.session.tempUserEmail;

        res.redirect('/home'); 
    } catch (error) {
        console.error(`Error during OTP verification: ${error}`);
        res.redirect('/otp?message=Sumthing error');
    }
};



const resendOtp = async (req, res) => {
    try {
        const userEmail = req.session.tempUserEmail;
        if (!userEmail) {
            return res.redirect('/register');
        }

        let digits = '0123456789';
        let newOtp = '';
        for (let i = 0; i < 4; i++) {
            newOtp += digits[Math.floor(Math.random() * digits.length)];
        }
        console.log(`New OTP: ${newOtp}`);

        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'drinkity999@gmail.com',
                pass: 'nxdp hcus aumy epmb',
            },
        });

        let mailOptions = {
            from: 'drinkity999@gmail.com',
            to: userEmail,
            subject: 'Your New OTP Code',
            text: `Your new OTP code is ${newOtp}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('New OTP email sent to: ' + userEmail);

        const exprTime = Date.now() + 5 * 60 * 1000; 
        await OTP.findOneAndUpdate(
            { email: userEmail },
            { otp: newOtp, exprTime: exprTime },
            { upsert: true } 
        );

        res.redirect('/otp');
    } catch (error) {
        console.error(`Error during OTP resend: ${error}`);
        res.redirect('/otp');
    }
};






//forget password--------------------------------------

const loadForgetPassword = async (req,res) => {
    const message = req.query.message
    res.render('user/forgott-password',{msg:message})
}

const loadOTPPassword = async (req,res) => {
    const message = req.query.message
    res.render('user/otp-password',{msg:message})
}

const loadPasswordChange = async (req,res) => {
    const message = req.query.message
    res.render('user/change-password',{msg:message})
}

const passwordReseted = async (req,res) => {
    res.render('user/password-reseted')
}

const forgotPassword =  async (req,res) => {
    try { 
        const {email} = req.body
        const user = await userSchema.findOne({email})
        if(!user) return res.redirect('/forgot-password?message=User not fount')
        
        await sendOtp(email)
        
        req.session.tempUserEmail = email
        
        res.redirect('/otp-password')
        
    } catch (error) {
        console.log(`Errore:${error}`)
    }
}



const verifyOtpForPassword = async (req,res) => {
    try {
        const { one, two, three, four } = req.body;
        const otp = one + two + three + four;


        const checkOTP = await OTP.findOne({ otp: otp, email: req.session.tempUserEmail });
        if (!checkOTP) {
            return res.redirect('/otp-password?message=Invalied otp');
        }

        const currentTime = Date.now();
        const exprTime = checkOTP.exprTime.getTime();

        if (currentTime > exprTime) {
            return res.redirect('/otp-password?message=OTP expierd');
        }

        res.redirect('/change-password')
    } catch (error) {
        console.log(`errore from verify otpfor password change : ${error}`);
        
    }
}

const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        

        const email = req.session.tempUserEmail;
        if (!email) {
            return res.redirect('/forgot-password?message=Session expired, please try again');
        }

   
        if (newPassword !== confirmPassword) {
            return res.redirect('/change-password?message=Passwords do not match');
        }

  
        const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

 
        const passwordChange = await userSchema.updateOne({ email }, { $set: { password: hashedPassword } });

   
        if (passwordChange.nModified === 0) {
            return res.redirect('/change-password?message=Failed to update password, try again');
        }

     
        res.redirect('/password-reseted');
    } catch (error) {
        console.log(`Error from change password: ${error}`);
        res.redirect('/change-password?message=An error occurred, try again');
    }
};






//logout-------------------------------------------------

const logout  = async (req,res) => {
    try {
        console.log('shgsd');
        
        req.session.destroy()
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    loadRegister,
    registerUser,
    loadotp,
    verifyOtp,
    resendOtp,
    login,
    logout,
    loadForgetPassword,
    forgotPassword,
    loadOTPPassword,
    verifyOtpForPassword,
    loadPasswordChange,
    changePassword,
    passwordReseted
};