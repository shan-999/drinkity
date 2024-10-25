const cartSchema = require('../../model/cart')
const products = require('../../model/products')
const users = require('../../model/userModel')
const category = require('../../model/category');



const loadCart = async (req, res) => {
    const userId = req.session.userId
    try {
    
        const categories = await category.find({ listed: true });

        
        const cart = await cartSchema.findOne({ userId})
            .populate('items.productId'); 

        let sum = 0
        cart.items.forEach((product)=>{
            
           sum += product.totalPrice
        })

        if (!cart) {
            return res.render('user/cart', { categories,sum, cart: null });
        }

        res.render('user/cart', { categories,sum, cart });
    } catch (error) {
        console.log(`Error in loadCart: ${error}`);
        res.status(500).send('Internal Server Error');
    }
}


const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {

        let cart = await cartSchema.findOne({ userId });


        if (!cart) {
            const totalPrice = await calculateNewPrice(productId, quantity);
            const newCart = new cartSchema({
                userId,
                items: [{ productId, quantity,totalPrice}],
                
            });
            await newCart.save();
            return res.status(200).json({ success: true, message: 'Cart created successfully' });
        }


        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        const totalPrice = await calculateNewPrice(productId, quantity);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
        } else {
            cart.items.push({ productId, quantity ,totalPrice });
        }

        await cartSchema.findOneAndUpdate(
            { userId, 'items.productId': productId }, 
            { 
                $set: { 'items.$.totalPrice': totalPrice } 
            },
            { new: true }
        );

        await cart.save();
        res.status(200).json({ success: true, message: 'Cart updated successfully' });

    } catch (error) {
        console.error(`Error in add to cart: ${error}`);
        res.status(500).json({ success: false, message: 'An error occurred while adding to cart' });
    }
};



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

    const product = await products.findById(productId);

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


const checkout = async (req,res) => {
    try {

        const categories = await category.find({ listed: true });

        res.render('user/checkout',{categories})
    } catch (error) {
        
    }
}



async function calculateNewPrice(productId, quantity) {
    const product = await products.findById(productId);
    if (!product) throw new Error('Product not found');
    
    const totalPrice = product.price * quantity;
    return totalPrice;
}




module.exports = {
    loadCart,
    addToCart,
    editCart,
    checkout
}