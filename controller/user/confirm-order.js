const productsSchema = require('../../model/products')
const users = require('../../model/userModel');
const orderSchema = require('../../model/order');
const category = require('../../model/category');
const cartSchema = require('../../model/cart')
const addressSchema = require('../../model/address')


const crypto = require('crypto');








const checkout = async (req, res) => {
    try {
        const userId = req.session.userId; 
        const categories = await category.find({ listed: true });
        const cart = await cartSchema.findOne({ userId }).populate('items.productId'); 
        const address = await addressSchema.findOne({ userId });
        const addresses = await addressSchema.find({ userId }).lean();

        if(!cart){
            return res.redirect('/cart')
        }

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




const confirmOrder = async (req, res) => {
    try {
        console.log('some call');
        
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



// for razorpay

const Razorpay = require("razorpay");


const razorpay = new Razorpay({
    key_id: "rzp_test_pp5Ul8PxlHsCpL",
    key_secret: "S5Ew9Qju67kwU7vzwhhoUklL"
})



const createRazourPayOrder = async (req,res) => {
    const  {amount} = req.body;

    try {
        const order = await razorpay.orders.create({
            amount : amount,
            currency: "INR",
            receipt: "receipt#1",
        })

        console.log('Generated order:', order);
        res.json(order)
    } catch (error) {
        console.log('this errore from crate orerd for razor pay',error);
        
    }
}

const verifyPayment = async (req,res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const hmac = crypto.createHmac('sha256', "S5Ew9Qju67kwU7vzwhhoUklL");
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');
        
        if (generatedSignature === razorpay_signature) {
            console.log(`verification success : generatedsig ${generatedSignature},  razorpay_signature ${razorpay_signature}`);
            
            res.send({success: true, status: 'Payment verified' });
        } else {
            console.log(`verification faild : generatedsig ${generatedSignature},  razorpay_signature ${razorpay_signature}`);
            
            res.status(400).send({success: false, status: 'Payment verification failed' });
        }
    } catch (error) {
        console.log(`error from verify payment ${error}`);
    }
}

module.exports = {
    loadOrderConfirmed,
    confirmOrder,
    checkout,
    selectedAddress,
    createRazourPayOrder,
    verifyPayment
}

