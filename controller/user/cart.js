const cartSchema = require('../../model/cart')
const productsSchema = require('../../model/products')
const users = require('../../model/userModel')
const category = require('../../model/category');
const addressSchema = require('../../model/address')
const orderSchema = require('../../model/order');
const userModel = require('../../model/userModel');
const wishlistSchema = require('../../model/wishlist')
const couponSchema = require('../../model/coupon')
const offerSchema = require('../../model/offers')
const mongoose = require('mongoose');



 


const loadCart = async (req, res) => {
    const userId = req.session.userId;
    try {
        const categories = await category.find({ listed: true });

        const cart = await cartSchema.findOne({ userId }).populate('items.productId');
            
        const message = req.body.errorMessage || null
        
        if(!cart){
            return res.render('user/cart', {categories, cart:null, message})
        }
        res.render('user/cart', { categories, cart , message});
    } catch (error) {
        console.log(`Error in loadCart: ${error}`);
        res.status(500).send('Internal Server Error');
    }
};





const addToCart = async (req, res) => {
    const {productId,quantity,price} = req.body
    const userId = req.session.userId
    try {

        if(!userId)  return res.status(401).json({success:false , message:"Login first to add to cart"})
        
        

        const user = await userModel.findById(userId);
        if (!user) {
          return res.status(404).json({ success: false, message: "User account not found" });
        }


        const cart = await cartSchema.findOne({userId})
        const product = await productsSchema.findById(productId);
        console.log(cart);
        
        let amount = price * quantity
        const totalPrice = amount
        if(!cart){
            let cartTotalPrice = totalPrice

            console.log(`totalPrice:${totalPrice}   carttotalprice:${cartTotalPrice}`);
            

            const newCart = new cartSchema({
                userId,
                items:[{ productId, quantity,totalPrice,price }],
                cartTotalPrice
            })
            console.log(newCart);
            
            newCart.save()
            return res.status(200).json({success:true,message:"cart added successfully"})
            
        }


        
       
        const itemIndex = cart.items.findIndex(item => item.productId.toString() == productId)
        cart.cartTotalPrice += totalPrice

        if(itemIndex > -1){
            const newQuantity = cart.items[itemIndex].quantity += Number(quantity)

            if (newQuantity > product.quantity){
                return res.status(404).json({success:false,message:'Quantity exceeds available stock'})
            }
            if(newQuantity > 10){
                return res.status(404).json({success: false,message: 'Quantity exceed the quantity limit'})
            }

            cart.items[itemIndex].quantity = newQuantity
            cart.items[itemIndex].totalPrice = price * newQuantity
    
        }else{

            if (quantity > product.quantity) {
                return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
            }

            if(quantity > 10){
                return res.status(404).json({success: false,message: 'Quantity exceed the quantity limit'})
            }

            cart.items.push({productId,quantity,totalPrice,price})
        }

        

        await cart.save()
        res.status(200).json({ success: true, message: 'Cart updated successfully' });
         
    } catch (error) {
        res.status(500).json({success:false , message: 'an error '})
        console.log(`error in add to cart ${error}`);
    }
}





const editCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.userId; 
   
    let cart = await cartSchema.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

   
    let cartItem = cart.items.find(item => item.productId.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    const product = await productsSchema.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    cartItem.quantity = quantity;
    cartItem.totalPrice = cartItem.price * quantity;

   
    cart.cartTotalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    
   
    await cart.save();

   
    res.json({
      updatedTotalPrice: cartItem.totalPrice,
      cartTotalPrice: cart.cartTotalPrice
    });

  } catch (error) {
    console.log(`Error updating cart: ${error}`);
    res.status(500).json({ message: 'Error updating cart' });
  }
};









const removeItem = async (req,res) => {
    const { productId } = req.body;
    try {
        
        const userId = req.session.userId; 


        const cart = await cartSchema.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } 
        },{ new: true } );
     
      
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const CartTotal = cart.items.reduce((sum, item) => {
            return sum + item.totalPrice;
        }, 0);

        cart.cartTotalPrice = CartTotal;
        await cart.save();


        res.json({ success: true ,cart:cart.cartTotalPrice});
    } catch (error) {
        console.error('Error in remove item from cart:', error);
        res.status(500).send('Internal Server Error');
    }
}




const addToWishList = async (req,res) => {
    try {
        const {productId} = req.body

        const userId = req.session.userId
        
        
        const wishlist = await wishlistSchema.findOne({userId:userId})
        
        
        if(!wishlist ){
            const newWishlist = new wishlistSchema({
                userId,
                products:[{productId}]
            })
            await newWishlist.save()

            return res.status(200).json({success:true,message:'added success'})
        }else{
            const productIdObject = new mongoose.Types.ObjectId(productId)
            
            const exitstProduct = wishlist.products.some(id => id.productId.toString() === productId)

            if(exitstProduct){
                return res.status(400).json({success:false , message:'Product already added to wishlist'})
            }
            
            
            await wishlistSchema.findOneAndUpdate({userId:userId},
                {$push:{products:{productId:productIdObject}}},
                {upsert:true}
            )

            return res.status(200).json({success:true,message:'added success'})

        }
        
    } catch (error) {
        console.log(`error form add to wish list : ${error}`);
        
    }
}




const loadWishList = async (req,res) => {
    try {
        const userId = req.session.userId
        
        const categories = await category.find({ listed: true });
        const wishlist = await wishlistSchema.findOne({userId:userId}).populate('products.productId').exec();
        
        if(!wishlist)return res.render('user/wishlist',{wishlist:null,categories,offProducts:null})
            
        const productIds = wishlist.products.map((product) => product.productId._id)

        const offProducts = await offerSchema.find(
            {applicableFor:{$in:productIds}}
        )
        

        res.render('user/wishlist',{wishlist,categories,offProducts})
    } catch (error) {
        console.log(`error form load wishlist : ${error}`);
        
    }
}


const removeWishListItem = async (req,res) => {
    try {
        const {productId} = req.body
        const userId = req.session.userId

        const wishlist = await wishlistSchema.findOneAndUpdate(
            {userId},
            {$pull: {products: { productId : productId }}},
            {new:true}
        )

        res.status(200).json({success:true, wishlist})
    } catch (error) {
        console.log(`error form remove cart item : ${error}`);
        
    }
}



const applyCoupen = async (req,res) => {
    try {
        const {code,totalPrice,discount} = req.body
        
        const coupons = await couponSchema.find({})
        
        const macthedCoupon = coupons.find(item => item.code === code)

        const dateNow = new Date()
        const userId = req.session.userId
        
        
        if(!macthedCoupon){
            console.log('jek');
            
            return res.status(400).json({success:false, message:'Invalied coupon code'})
        }
        else if(macthedCoupon.validTo <= dateNow || macthedCoupon.usageLimit <= 0){
            await couponSchema.findByIdAndUpdate(macthedCoupon._id,
                {$set:{status:'Expired'}}
            )

            return res.status(400).json({success:true, message:'The coupon has expired or has reached its usage limit'})
        }
        else if(totalPrice < macthedCoupon.minValue){
                return res.status(400).json({success:false, message:`Total price must be cover minimum value to apply the coupon.`})
        }
        else if(macthedCoupon.usedBy.length > 0){
            const used = macthedCoupon.usedBy.some(item => item === userId.toString())
            if(used){
                return res.status(400).json({success:false, message:'this coupen you will alredy used'})
            }
        }

        
        if(macthedCoupon){
            const couponDiscount = macthedCoupon.value
            let totalDiscount = discount
            
            if(macthedCoupon.type === 'fixed'){
                totalDiscount += couponDiscount
            }else{
                const discountPrice = (couponDiscount / 100) * totalPrice
                totalDiscount += discountPrice              
            }

            req.session.couponDiscount = totalDiscount

            res.status(200).json({success:true, totalDiscount})
        }else {
            res.status(400).json({success:false, message:'Invalied coupon code'})
        }

        
        await couponSchema.findByIdAndUpdate(macthedCoupon._id,
            {
                $inc:{usageLimit:-1},
                $push:{usedBy:userId}
            }
        )
        
    } catch (error) {
        console.log(`error form apply coupen ${error}`);
    }
}



const removeCoupen = async (req,res) => {
    try {
        const {code} = req.body 

        const userId = req.session.userId
        

        const coupon = await couponSchema.findOneAndUpdate({code},
            {$pull:{usedBy:userId.toString()}},
            {new:true}
        )
        

        req.session.couponDiscount = null

        res.status(200).json({success:true})
    } catch (error) {
        console.log(`error form remove coupon :${error}`);
        
    }
}


module.exports = {
    loadCart,
    addToCart,
    editCart,
    removeItem,
    addToWishList,
    loadWishList,
    removeWishListItem,
    applyCoupen,
    removeCoupen
}