const session = require('express-session');
const addressSchema = require('../../model/address'); 
const categorySchema = require('../../model/category');
const userSchema = require('../../model/userModel');







const loadAddress = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const user = await userSchema.findById(req.session.userId);

        
        const page = parseInt(req.query.page) || 1;
        const limit = 2;  
        const skip = (page - 1) * limit;  

        
        const addresses = await addressSchema.find({ userId: user._id })
                                              .skip(skip)
                                              .limit(limit);


        const totalAddresses = await addressSchema.countDocuments({ userId: user._id });
        const totalPages = Math.ceil(totalAddresses / limit);

        res.render('user/account-address', { 
            categories, 
            user, 
            addresses, 
            currentPage: page, 
            totalPages, 
            limit, 
            activePage: 'address'
        });
    } catch (error) {
        console.error(`Error in loading addresses: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};



const loadAddAddress = async (req,res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const user = await userSchema.findById(req.session.userId);
        const address = await addressSchema.find({ userId: user._id });


        res.render('user/add-address', { categories ,address });
    } catch (error) {
        console.error(`Error in load add Address: ${error}`);
        res.status(500).send("Internal Server Error");
    }
}


const addAddress = async (req,res) =>     {
    try {
        if(!req.session.userId) return res.redirect('/home')
        const {fullName,address,email,mobile,city,pincode,state,landmark} = req.body

        const user = await userSchema.findById(req.session.userId);
    
        const newaddress = new addressSchema({
            userId:req.session.userId,
            fullName,
            address,
            landmark,
            city,
            PINCode:pincode,
            phonNumber:mobile,
            state,
            email
        })

        await newaddress.save()

        res.redirect('/account-address')
        
    } catch (error) {
        console.error(`Error in adding Address: ${error}`);
        res.status(500).send("Internal Server Error");
    }
}


const loadEditAddress = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const user = await userSchema.findById(req.session.userId);
        const address = await addressSchema.findById(req.params.addressId);

        res.render('user/edit-address', { categories, user, address });
    } catch (error) {
        console.error(`Error in load edit Address: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};

const editAddress = async (req, res) => {
    try {
        const {addressId} = req.params; 
        console.log(addressId);
        
        const updatedData = {
            fullName: req.body.fullName,
            address: req.body.address,
            email: req.body.email,
            phonNumber: req.body.mobile,
            city: req.body.city,
            PINcode: req.body.pincode,
            state: req.body.state,
            landmark: req.body.landmark,
        };


        const updatedAddress = await addressSchema.findByIdAndUpdate(addressId, updatedData, { new: true });

        if (updatedAddress) {
            res.redirect('/account-address');
        } else {
            res.status(404).send("Address not found");
        }
    } catch (error) {
        console.error(`Error in editing Address: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};



// to delete address
const deleteAddress = async (req,res)=>{
    const address = req.params.id
    try {

        const addressCheck = await addressSchema.findByIdAndDelete(address)

        if(!addressCheck) return res.status(400).json({success:false})
        
            return res.status(200).json({success:true})
    } catch (error) {
        
    }
}

module.exports = {
    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress

}