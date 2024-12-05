const categorySchema = require('../../model/category')
const orderSchema = require('../../model/order')
const userSchema = require('../../model/userModel')
const productsSchema = require('../../model/products');
const order = require('../../model/order');
const walletSchema = require('../../model/wallet');
const wallet = require('../../model/wallet');
const coupon = require('../../model/coupon');


const loadAccountOrders = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const user = await userSchema.findOne(req.session.userId)


        const page = parseInt(req.query.page) || 1
        const limit = 7
        const skip = (page - 1) * limit
        
        const order = await orderSchema.find({ userId: req.session.userId }).skip(skip).limit(limit)


        const taotalOrders = await orderSchema.countDocuments({userId:req.session.userId})
        const totalPages = Math.ceil(taotalOrders / limit)

        res.render('user/account-orders', { categories, order ,user , activePage: 'order' , currentPage: page, totalPages, limit}); 
    } catch (err) {
        console.log(`this is from load order: ${err}`)
    }
};


const laodOrderDetais = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const categories = await categorySchema.find({ listed: true });

        const order = await orderSchema.findById(orderId).populate("products"); 

        
        if (!order) {
            return res.status(404).send("Order not found");
        }
        
        const shippingFee = order.Totalprice > 500 ? 0 : 60

        let estimatedTotal = Number(order.Totalprice) + shippingFee

        let subTotal = order.products.reduce((acc,item) => item.status === 'Cancelled' ? acc + 0 : acc + item.total ,0)

        const isCancelled = order.products.every(item => item.status === 'Cancelled')         

        
        if(isCancelled){
            estimatedTotal = order.products.reduce((acc,item) => acc + item.total ,0) + shippingFee
            subTotal = order.products.reduce((acc,item) => acc + item.total ,0)
            return res.render("user/order-details", {
                order,
                categories,
                estimatedTotal,
                subTotal,
                isCancelled
            })
        }else{
            res.render("user/order-details", { order ,categories, estimatedTotal ,subTotal, isCancelled}); 
        }
        

    } catch (err) {
        console.log(`This is from load order details: ${err}`);
        res.status(500).send("Server error");
    }
};





const cancelOrder = async (req,res) => {
    const {productId,orderId} = req.body
    const userId = req.session.userId

    try {
        const order = await orderSchema.findById(orderId)
        
        if(!order){
            return res.status(400).json({success: false , message : 'order not fount'})
        }


        if(order.coupenApplied.applied){
            return res.status(400).json({success:false,message:'Coupon applied! Cancellation is not allowed.'})
        }
        

        const indexOfProduct = order.products.findIndex(item => item.productId.toString() === productId)

        order.products[indexOfProduct].status = "Cancelled"
        order.Totalprice -= order.products[indexOfProduct].total

        
        await order.save()
        const product = await productsSchema.findOneAndUpdate({_id:productId},
            {$inc:{quantity:order.products[indexOfProduct].quantity}}
        )


        const wallet = await walletSchema.findOne({userId})

        

        if(!wallet){

            if(order.coupenApplied){
                
            }
            
            const balance = order.products[indexOfProduct].total

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

            console.log(newWallet);
            
        }else{
            const amount = order.products[indexOfProduct].total

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

            console.log('all done');
            
        }
        
        return res.status(200).json({success : true , message : 'Your order canceled'})        

        

    } catch (error) {
        console.log('this is from cancel order',error);
    }
}



// for return order

const returnOrder = async (req,res) => {
    try {
        const {reason,additionalInfo,productId,orderId} = req.body

        const userId = req.session.userId

        console.log(reason,additionalInfo);
        

        const order = await orderSchema.findById(orderId)
        const productIndex  = order.products.findIndex(item => item.productId.toString() === productId )

        const productName = order.products[productIndex].productName
        order.products[productIndex].requst.requastName = `Requast for return product ${productName}`
        order.products[productIndex].requst.reason = `${reason} :- ${additionalInfo}`
        order.products[productIndex].requst.approve = false
        

        order.save()

        res.status(200).json({success:true})
                
    } catch (error) {
        console.log(`this error from return order ${error}`);
        
    }
}




module.exports = {
    loadAccountOrders,
    laodOrderDetais,
    cancelOrder,
    returnOrder
}