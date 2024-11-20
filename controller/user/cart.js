const cartSchema = require('../../model/cart')
const productsSchema = require('../../model/products')
const users = require('../../model/userModel')
const category = require('../../model/category');
const addressSchema = require('../../model/address')
const orderSchema = require('../../model/order');
const userModel = require('../../model/userModel');



<<<<<<< HEAD




=======
>>>>>>> fa130ed472eaafe5b602dbea4beeaf1885876b25
const loadCart = async (req, res) => {
    const userId = req.session.userId;
    try {
        const categories = await category.find({ listed: true });

        const cart = await cartSchema.findOne({ userId }).populate('items.productId');
            
        console.log(cart);
        const message = req.body.errorMessage || null
        
        if(!cart){
            return res.render('user/cart', {categories, cart:null, message  })
        }
        res.render('user/cart', { categories, cart , message});
    } catch (error) {
        console.log(`Error in loadCart: ${error}`);
        res.status(500).send('Internal Server Error');
    }
};





const addToCart = async (req, res) => {
    const {productId,quantity} = req.body
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
        
        let amount = product.price * quantity
        const totalPrice = amount
        if(!cart){
            let cartTotalPrice = totalPrice

            console.log(`totalPrice:${totalPrice}   carttotalprice:${cartTotalPrice}`);
            

            const newCart = new cartSchema({
                userId,
                items:[{ productId, quantity,totalPrice}],
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
    
        }else{

            if (quantity > product.quantity) {
                return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
            }

            if(quantity > 10){
                return res.status(404).json({success: false,message: 'Quantity exceed the quantity limit'})
            }

            cart.items.push({productId,quantity,totalPrice})
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
    cartItem.totalPrice = product.price * quantity;

   
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



module.exports = {
    loadCart,
    addToCart,
    editCart,
    removeItem
}