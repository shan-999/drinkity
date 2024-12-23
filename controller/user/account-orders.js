const categorySchema = require('../../model/category')
const orderSchema = require('../../model/order')
const userSchema = require('../../model/userModel')
const productsSchema = require('../../model/products');
const walletSchema = require('../../model/wallet');
const PDFDocument = require('pdfkit');
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')



const loadAccountOrders = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });
        const user = await userSchema.findOne(req.session.userId)


        const page = parseInt(req.query.page) || 1
        const limit = 7
        const skip = (page - 1) * limit
        
        const order = await orderSchema.find({ userId: req.session.userId }).skip(skip).limit(limit).sort({orderDate:-1})


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

        const order = await orderSchema.findById(orderId).populate("products")

        
        if (!order) {
            return res.status(404).send("Order not found");
        }


        const page = parseInt(req.query.page) || 1
        const limit = 4
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit

        const totalProducts = order.products.length
        const paginatedProducts = order.products.slice(startIndex, endIndex)

        
        const shippingFee = order.Totalprice > 500 ? 0 : 60

        let estimatedTotal = Number(order.Totalprice) 

        let subTotal = order.products.reduce((acc,item) => item.status === 'Cancelled' ? acc + 0 : acc + item.total ,0)

        const isCancelled = order.products.every(item => item.status === 'Cancelled')  
        
        const isDeliverd = order.products.some(item => item.status === 'Delivered')

        
        if(isCancelled){
            subTotal = order.products.reduce((acc,item) => acc + item.total ,0) 
            estimatedTotal = subTotal + shippingFee
        }

        const pagination = {
            totalItems: totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            hasNextPage: endIndex < totalProducts,
            hasPrevPage: startIndex > 0,
        };

        const user = await userSchema.findById(order.userId)
        
        res.render("user/order-details", {
            order,
            user,
            categories,
            paginatedProducts,
            estimatedTotal,
            subTotal,
            isCancelled,
            isDeliverd,
            pagination,
        })
        

    } catch (err) {
        console.log(`This is from load order details: ${err}`);
        res.status(500).send("Server error");
    }
};





const cancelOrder = async (req,res) => {
    const {productId,orderId} = req.body
    // const userId = req.session.userId

    try {
        const order = await orderSchema.findById(orderId)
        const userId = order.userId
        
        if(!order){
            return res.status(400).json({success: false , message : 'order not fount'})
        }


        if(order.coupenApplied.applied){
            return res.status(400).json({success:false,message:'Coupon applied! Cancellation is not allowed.'})
        }
        
        
        const indexOfProduct = order.products.findIndex(item => item.productId.toString() === productId ) 
        
        

        order.products[indexOfProduct].status = "Cancelled"
        order.Totalprice -= order.products[indexOfProduct].total

        
        await order.save()
        const product = await productsSchema.findOneAndUpdate({_id:productId},
            {$inc:{quantity:order.products[indexOfProduct].quantity}}
        )


        if(order.paymentMethourd === 'Razorpay' && order.PaymentStatus === 'Success'){

                const wallet = await walletSchema.findOne({userId})


                if(!wallet){
                    
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

                    
                    
                }
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


const downloadInvoice = async (req,res) => {
    try {
        const {orderId} = req.body
        const order = await orderSchema.findById(orderId)

        const DeliveredOrders = order.products.filter(item => item.status === 'Delivered')

        const subTotal = DeliveredOrders.reduce((sum,item) => sum + item.total,0)
        const totatlQuantiy = DeliveredOrders.reduce((sum,item) => sum + item.quantity,0)

        const invoiceData = {
            invoiceNumber: orderId.slice(-10),
            invoiceDate: new Date(order.orderDate).toLocaleDateString(),
            name: order.customer.userName,
            address: `${order.customer.address.state}, ${order.customer.address.city} city ,nearby ${order.customer.address.landMark}`,
            items:DeliveredOrders.map(item => {
                return {
                    productName: item.productName,
                    unitPrice: item.price,
                    quantity: item.quantity,
                }
            }),
            totatlQuantiy:totatlQuantiy,
            subTotal:subTotal
          }  

        

        
        const doc = new PDFDocument();
      
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"')

        doc.pipe(res);
        // doc.setFont('helvetica')
        // doc.setFontType('bold')
      
        doc.fontSize(20).text('INVOICE', { align: 'center' }).moveDown()

        doc.fontSize(12)
            .text(`Invoice #: ${invoiceData.invoiceNumber}`, 50, 120) 
            .text(`Invoice Date: ${invoiceData.invoiceDate}`, 50, 140)
            .text(`Ship To: ${invoiceData.name}`, 50, 160)
            .text(invoiceData.address, 50, 180) 
            .moveDown(2)



        const tableTop = 190
        const itemColumn = 50
        const quantityColumn = 300
        const unitPriceColumn = 380
        const amountColumn = 460

        doc
        .fontSize(10)
        .fillColor('#f0f0f0') 
        .rect(itemColumn - 10, tableTop - 10, 520, 20) 
        .fill();

        doc.fillColor('#000000'); 
        doc.text('Product Name', itemColumn, tableTop - 5)
        doc.text('Quantity', quantityColumn, tableTop - 5)
        doc.text('Unit Price', unitPriceColumn, tableTop - 5)
        doc.text('Amount', amountColumn, tableTop - 5)

        doc.moveTo(itemColumn - 10, tableTop + 10).lineTo(570, tableTop + 10).stroke();

        let currentY = tableTop + 20;
        for (const item of invoiceData.items) {
            doc.fillColor('#000000')
            doc.text(item.productName, itemColumn, currentY);
            doc.text(item.quantity.toString(), quantityColumn, currentY);
            doc.text(item.unitPrice.toFixed(2), unitPriceColumn, currentY);
            doc.text((item.quantity * item.unitPrice).toFixed(2), amountColumn, currentY);
            currentY += 20;
        }

        doc.moveTo(itemColumn - 10, currentY + 5).lineTo(570, currentY + 5).stroke();

        doc.fontSize(12).text(`Total Quantity: ${invoiceData.totatlQuantiy}`, unitPriceColumn, currentY + 20);
        doc.text(`Subtotal: INR ${invoiceData.subTotal.toFixed(2)}`, 380, currentY + 40);

        doc.end();
            
        
        
    } catch (error) {
        console.log(`error form dowload invoice : ${error}`)
    }
}

const laodTermsAdnContion = async (req,res) => {
    try {
        const categories = await categorySchema.find({listed:true})
        res.render('user/terms-and-contion',{categories})
    } catch (error) {
        console.log('error in load terms and contion : ',error);
        
    }
}

module.exports = {
    loadAccountOrders,
    laodOrderDetais,
    cancelOrder,
    returnOrder,
    downloadInvoice,
    laodTermsAdnContion
}