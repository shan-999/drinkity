const cartSchema = require('../../model/cart')
const productsSchema = require('../../model/products')
const users = require('../../model/userModel')
const category = require('../../model/category');
const addressSchema = require('../../model/address')
const orderSchema = require('../../model/order');
const userModel = require('../../model/userModel');




const loadCart = async (req, res) => {
    const userId = req.session.userId;
    try {
        const categories = await category.find({ listed: true });

        const cart = await cartSchema.findOne({ userId }).populate('items.productId');
            
        console.log(cart);
        
        if(!cart){
            return res.render('user/cart', {categories, cart:null})
        }

        res.render('user/cart', { categories, cart });
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



const checkout = async (req, res) => {
    try {
        const userId = req.session.userId; 
        const categories = await category.find({ listed: true });
        const cart = await cartSchema.findOne({ userId }).populate('items.productId'); 
        const address = await addressSchema.findOne({ userId });
        const addresses = await addressSchema.find({ userId }).lean();

        let hasExcessQuantity = false
        let exceedsItems = []
        cart.items.forEach(item => {
            const product = item.productId  
            if(item.quantity > product.quantity){
                hasExcessQuantity = true
                exceedsItems.push(product.productName)
            }
        })
        console.log("exceed items:"+exceedsItems);
        

        if (hasExcessQuantity) {
            const errorMessage = `The following items exceed available stock: ${exceedsItems.join(', ')}`;
            return res.redirect(`/cart?errorMessage=${encodeURIComponent(errorMessage)}`);
        }

        
        let totalProductPrice = cart.cartTotalPrice;

        const shippingFee = totalProductPrice > 500 ? 0 : 60; 
        const discount = 0; 
        const totalPrice = totalProductPrice + shippingFee - discount; 

        res.render('user/checkout', {
            categories,
            cart,
            address,
            addresses,
            shippingFee,
            discount,
            totalPrice,
            totalProductPrice
        });
    } catch (error) {
        console.error(`errore in checkout ${error}`);
        res.status(500).send('Internal Server Error');
    }
};


const selectedAddress = async (req,res) => {
    try {
        const addressId = req.params.id;
        const address = await addressSchema.findById(addressId).lean();
        
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(address);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).send('Internal Server Error');
    }
}



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



const confirmOrder = async (req, res) => {
    try {

        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const {address,products,paymentMethod,totalPrice} = req.body
        
        
        const productId = products.map(product => product.productId)
        

        const productsInDb = await productsSchema.find({ _id: { $in: productId } });
        
        const productsInDbMap = {};
        productsInDb.forEach(product => {
            productsInDbMap[product._id.toString()] = product.quantity; 
        });

        for (let product of products) {
            if (product.quantity <= 0) {
                
                return res.status(400).json({
                    message: `Invalid quantity for product: ${product.productName}`,
                    showAlert: true
                });
            }
            
            
            const dbQuantity = productsInDbMap[product.productId.toString()];
            

            if (product.quantity > dbQuantity) {
                return res.status(400).json({
                    message: `Quantity exceeds available stock for product: ${product.productName}`,
                    showAlert: true
                });
            }
        }
        
        let orderAddress
        if(address.custom === false){
            orderAddress = await addressSchema.findById(address.id)
        }else{
            orderAddress = address
        }
        console.log(orderAddress);
         
      
        const user = await users.findById(req.session.userId)
        const newOrder = new orderSchema({
            userId:req.session.userId,
            customer: {
                userName: user.userName,
                email: user.email,
                address: {
                    landMark: orderAddress.landmark,
                    city: orderAddress.city,
                    state: orderAddress.state,
                    postalCode: orderAddress.PINCode,
                    phonNumber:orderAddress.phonNumber
                }
            },
            products: products.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
                image: item.image
            })),
            Totalprice: totalPrice,
            paymentMethourd: paymentMethod,
            orderDate: new Date(),
            status: 'Pending'
        });

        await newOrder.save();

     
        for (let item of products) {
            await productsSchema.findByIdAndUpdate(item.productId, {
                $inc: { quantity: -item.quantity }
            });
        }

        await cartSchema.deleteMany({ userId: req.session.userId });
      
        res.status(200).json({
            message: 'Order placed successfully',
            redirect: `/order-confirmed/${newOrder._id}`
        });

    } catch (error) {
        console.error(`Error in confirmOrder: ${error.message}`);
        res.status(500).json({
            message: 'Server error. Please try again later.',
            showAlert: true
        });
    }
};







const loadOrderConfirmed = async (req, res) => {
    try {
        const categories = await category.find({ listed: true });
        const orderId = req.params.orderId; 
        const order = await orderSchema.findById(orderId); 

        if (!order) {
            return res.status(404).send("Order not found");
        }

        res.render('user/order-confirmed', { categories, order });
    } catch (error) {
        console.log(`Error in loadOrderConfirmed: ${error.message}`);
    }
};













module.exports = {
    loadCart,
    addToCart,
    editCart,
    checkout,
    selectedAddress,
    confirmOrder,
    loadOrderConfirmed,
    removeItem
}