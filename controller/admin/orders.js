const orderSchema = require('../../model/order');
const productsSchema = require('../../model/products');
const userModel = require('../../model/userModel');
const walletSchema = require('../../model/wallet');

const loadOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 7; 
        const skip = (page - 1) * limit;

        const orders = await orderSchema.find().populate('userId').skip(skip).limit(limit).sort({orderDate:-1})
        // const users = await userModel.aggregate([{ $group:{ _id: "$_id",userName:{ $first:"$userName" },email:{$first:"$email" }}}])

        

        const totalProducts = await orderSchema.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/orders', { orders ,page , totalPages});
    } catch (error) {
        console.log('Error in loadOrder: ' + error);
        res.status(500).send('An error occurred while loading orders.');
    }
};


const updateStats = async (req,res) => {
    try {
        const { orderId } = req.params;
        const { status,productId } = req.body;
        
        const order = await orderSchema.findById(orderId)
        
        
        const productIndex = order.products.findIndex(item => item.productId.toString() === productId)
        
        order.products[productIndex].status = status

        if(status === 'Cancelled'){
            if(order.coupenApplied.applied){
                return res.status(400).json({success:false,message:'Coupon applied! Cancellation is not allowed.'})
            }

            const product = await productsSchema.findOneAndUpdate({_id:productId},
                {$inc:{quantity:order.products[productIndex].quantity}}
            )

            if(order.paymentMethourd === "Razorpay" && order.PaymentStatus === 'Success'){
                const userId = order.userId
                const wallet = await walletSchema.findOne({userId})
                
                
                if(!wallet){
                    
                    const balance = order.products[productIndex].total
    
                    const newWallet = new walletSchema({
                        userId,
                        balance,
                        transactions:[
                            {
                                trascationDate:new Date(),
                                trascationType:"Debit",
                                description: 'For cancel product',
                                amount:balance
                            }
                        ]
                    })
                    await newWallet.save()
                    
                }else{
                    const amount = order.products[productIndex].total
    
                    const transactions = {
                        trascationDate:new Date(),
                        trascationType:"Debit",
                        description:'For cancel product',
                        amount
                    }
    
                    await walletSchema.findOneAndUpdate({userId},
                        {
                            $push:{transactions},
                            $inc:{balance:amount}
                        }
                    )
    
                    
                    
                }
            }
        }



        await order.save()
        
        res.status(200).json({ message: 'Order status updated successfully', });

    } catch (error) {
        console.log('Error in update order: ' , error);
        res.status(500).send('An error occurred while loading orders.');
    }
}




const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId; 
        const order = await orderSchema.findById(orderId).populate('userId').populate('products');

        
        if (!order) {
            return res.status(404).send("Order not found");
        }
        
        res.render('admin/order-details', { order });
    } catch (error) {
        console.log('Error in loadOrderDetails:', error);
        res.status(500).send("Server Error");
    }
};


const approveReturnRequst = async (req,res) =>{
    try {
        
        const {orderId,productId} = req.body
        // const userId = req.session.userId
        
        const order = await orderSchema.findById(orderId)
        const userId = order.userId
        const wallet = await walletSchema.find({userId:userId})

        

        const indexOfProduct = order.products.findIndex(item => item.productId.toString() === productId)
        
        
        if(wallet.length <= 0){
            let balance = order.products[indexOfProduct].total
            
            if(order.coupenApplied.applied){
                const discount = order.coupenApplied.discount

                const totalProducts = order.products.length 

                const discountPerProduct = discount / totalProducts 
                
                balance -= discountPerProduct
            }


            const newWallet = new walletSchema({
                userId,
                balance,
                transactions:[
                    {
                        trascationDate:new Date(),
                        trascationType:'Debit',
                        description: 'For return product',
                        amount:balance
                    }
                ]
            })

            await newWallet.save()
        }else{

            let amount =  order.products[indexOfProduct].total

            console.log(`amoutbefor : ${amount}`);
            

            if(order.coupenApplied.applied){
                const discount = order.coupenApplied.discount

                const totalProducts = order.products.length 

                const discountPerProduct = discount / totalProducts 
                
                amount -= discountPerProduct

                console.log(`amout : ${amount}    discount : ${discount}   totalProducts : ${totalProducts}  discountperproducts : ${discountPerProduct}`);
            }

            
            
            

            const newtrascation = {
                trascationDate:new Date(),
                trascationType:'Debit',
                description:'For return product',
                amount:amount
            }
            
            await walletSchema.updateOne(
                {userId},{
                    $push:{transactions : newtrascation},
                    $inc:{balance:amount}
                }
            )
            
        }

        order.products[indexOfProduct].status = 'Returned'
        order.products[indexOfProduct].requst.approve = true


        order.save()
        const quantityInOrder = order.products[indexOfProduct].quantity
        await productsSchema.updateOne(
            {_id:productId},
            {$inc:{quantity:quantityInOrder}}
        )

        

        res.status(200).json({success: true })

    } catch (error) {
        console.log(`error form approve return requst : ${error}`);
        
    }
}




module.exports = {
    loadOrder,
    updateStats,
    loadOrderDetails,
    approveReturnRequst
}