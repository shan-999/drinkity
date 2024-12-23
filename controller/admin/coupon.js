const couponSchema = require('../../model/coupon')
const mongoose = require('mongoose')

const loadCoupon  = async (req,res) => {
    try {
        const coupons = await couponSchema.find()
        const message = req.query.message|| null

        res.render('admin/coupon',{coupons,message})
    } catch (error) {
        console.log(`error from load coupon : ${error}`);
        
    }
} 


const addCoupon = async (req,res) =>{
    try {
       const {code,type,value,validity,minValue,usageLimit} = req.body

       if(!code || !type || !value || !validity || !minValue || !usageLimit){
        return res.redirect('/admin/coupon')
       }

       if(type === 'fixed'){
            if(value > minValue/2){              
                return res.redirect('/admin/coupon')
            }
       }else{
            if(value > 50){
                return res.redirect('/admin/coupon')
            }
       }
       if(usageLimit < 5 || value < 10 || minValue < 100){
        return res.redirect('/admin/coupon')
       }

       const coupons = await couponSchema.find()
       const macthedCoupon = coupons.some(coupon => coupon.code === code)
       if(macthedCoupon){
        return res.redirect('/admin/coupon')
       }

       const date = new Date()
       const validityTo = new Date(validity).toISOString()

       if(validityTo < date || usageLimit <= 0){
        return res.redirect('/admin/coupon')
       }

       const newCoupen = new couponSchema({
        code,
        type,
        value,
        valideFrom:new Date(),
        validTo:validity,
        usageLimit,
        minValue,
       })

       await newCoupen.save()

       res.redirect('/admin/coupon')

       
    } catch (error) {
       console.log(`error form add a coupen : ${error}`);
    }
}



const loadEditModal = async (req,res) => {
    try {
        const couponId = req.params.id
       
        const coupon = await couponSchema.findById(couponId)

        res.status(200).json({success:true,coupon})
    } catch (error) {
        console.log(`error from load Edit modal : ${error}`);
    }
}


const editCoupon = async (req,res) => {
    try {
        const {code,type,value,validity,minValue,usageLimit} = req.body
        const couponId = req.params.id


        if(!code || !type || !value || !validity || !minValue || !usageLimit){
            return res.redirect('/admin/coupon')
        }

        if(type === 'fixed'){
            if(value > minValue/2){              
                return res.redirect('/admin/coupon')
            }
       }else{
            if(value > 50){
                return res.redirect('/admin/coupon')
            }
       }
       if(usageLimit < 5 || value < 10 || minValue < 100){
        return res.redirect('/admin/coupon')
       }


        const coupons = await couponSchema.find()
        const macthedCoupon = coupons.filter(item => item.code !== code).some(item => item.code === code)
        console.log(macthedCoupon);
        
        if(macthedCoupon){
            return res.redirect('/admin/coupon')
        }

        const date = new Date()
        const validityTo = new Date(validity).toISOString()
        let status 
        console.log(usageLimit);
        
        if(validityTo < date || usageLimit <= 0)    {
            status = 'Expired'
        }else{
            status = 'Valied'
        }
        

        const updatedCoupen = await couponSchema.findByIdAndUpdate(couponId,
            {code,type,value,validTo:validity,minValue,usageLimit,status},
            {upsert:true,new:true}
        )

        res.redirect('/admin/coupon') 

    } catch (error) {
        console.log(`error form edit coupon : ${error}`);
    }
}


const deleteCoupon = async (req,res) => {
    try {
        const {couponId} = req.body
        
        const deletedcoupen = await couponSchema.findByIdAndDelete(couponId)

        res.status(200).json({success:true,message:'Deleted successfully'})        
    } catch (error) {
        console.log(`error from delete coupon : ${couponId}`);
    }
}
module.exports = {
    loadCoupon,
    addCoupon,
    loadEditModal,
    editCoupon,
    deleteCoupon
}