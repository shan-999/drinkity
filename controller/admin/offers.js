const category = require('../../model/category')
const offerSchema = require('../../model/offers')
const productSchema = require('../../model/products')
const categorySchema = require('../../model/category')
const mongoose = require('mongoose')




const loadOffers = async (req,res) => {
    try {
        const categories = await categorySchema.find({listed:true})
        const products = await productSchema.find({listed:true})

        const page = parseInt(req.query.page) || 1
        const limit = 4
        const skip = (page - 1) * limit

        const offers = await offerSchema.find({}).skip(skip).limit(limit)
        const totalOffers = await offerSchema.countDocuments({})
        const toatlPages = Math.ceil(totalOffers / limit)



        let applicableFor = []
        for(let offer of offers){
            if(offer.offType === 'product'){
                const prouduct = await productSchema.findById(offer.applicableFor)
                applicableFor.push(prouduct.productName)
            }else{
                const category = await categorySchema.findById(offer.applicableFor)
                applicableFor.push(category.categoryName)
            }
        }
        
        

        res.render('admin/offers', {offers,categories,products,applicableFor,toatlPages,page})
    } catch (error) {
        console.log(`error form load offers ${error}`);
        
    }
}


const addOffer = async (req,res) => {
    try {
        const {offName,type,maxDiscount,validTo,offValue,offType,categoryId,productId} = req.body
        
        console.log(productId,categoryId);
        if(!offName || !type || !maxDiscount || !validTo || !offValue || !offType ){
            return res.redirect('/admin/offers')
        }
        
        if(offType === 'category' && maxDiscount > 20){
            return res.redirect('/admin/offers')       
        }else if(offType === 'product'){
            console.log(productId);
            const id = new mongoose.Types.ObjectId(productId)
            const product = await productSchema.find(id)
            
            if(type === 'fixed' && maxDiscount > (product[0].price/2)){
                return res.redirect('/admin/offers')
            }else if(type === 'percentage' && offValue > 50){
                return res.redirect('/admin/offers')                
            }
        }
        


        if(offType === 'product' && !productId ) return res.redirect('/admin/offers')

        if(offType === 'category' && !categoryId) return res.redirect('/admin/offers')


        const applicableFor = offType === 'product' ? productId : categoryId





        
        
        
        const date = new Date()
        if(validTo < date){
            return res.redirect('admin/offers')
        }
        
        
        const newoffer = new offerSchema({
            offName,
            type,
            maxDiscount,
            offValue,
            valiedTo:validTo,
            valideFrom:new Date(),
            offType,
            applicableFor,
        })

        await newoffer.save()
        
        res.redirect('/admin/offers')       
        
    } catch (error) {
        console.log(`error in add offer : ${error}`);
        
    }
}


const loadEditoffer = async (req,res) => {
    try {
        const offerId = new mongoose.Types.ObjectId(req.params.id);

        const offer = await offerSchema.findById(offerId)

        let applicableFor 
        if(offer.offType === 'category'){
            const category = await categorySchema.findById(offer.applicableFor)
            applicableFor = category.categoryName
        }else{
            const product = await productSchema.findById(offer.applicableFor) 
            applicableFor = product.productName
        }
        
        

        res.status(200).json({success:true,offer,applicableFor})
    } catch (error) {
        console.log(`error form load edit offer : ${error}`);
    }
}



const editOffer = async (req,res) => {
    try {
        const offerId = req.params.offerId
        const {offName,type,maxDiscount,validTo,offValue,offType,categoryId,productId} = req.body
        
        if(!offName || !type || !maxDiscount || !validTo || !offValue || !offType ){
            return res.redirect('/admin/offers')
        }

        const date = new Date()
        if(validTo < date){
            return res.redirect('admin/offers')
        }

        if(offType === 'product' && !productId ) return res.redirect('/admin/offers')

        if(offType === 'category' && !categoryId) return res.redirect('/admin/offers')

        const applicableFor = offType === 'product' ? productId : categoryId


        const newoffer = await offerSchema.findByIdAndUpdate(offerId,
            {offName,type,maxDiscount,offValue,valiedTo:validTo,offType,applicableFor},
            {new:true}
        )


        res.redirect('/admin/offers')        
    } catch (error) {
        console.log(`error form edit offer :${error}`);
    }
}



const deleteOffer = async (req,res) => {
    try {
        const {offerId} = req.body

        const offer = await offerSchema.findById(offerId)



        await offerSchema.findByIdAndDelete(offerId)

       

        res.status(200).json({success:true})
    } catch (error) {
        console.log(`error form delete offer : ${error}`);
        
    }
}




module.exports = {
    loadOffers,
    addOffer,
    loadEditoffer,
    editOffer,
    deleteOffer
}