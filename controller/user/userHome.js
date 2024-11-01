const category = require('../../model/category');
const productsmodel = require('../../model/products');
const cartSchema = require('../../model/cart')



// const loadHome = async (req, res) => {
//     try {
//         const categories = await category.find({ listed: true });

//         const products = await productsmodel.find({ listed: true }); 

//         const cart = await cartSchema.findOne({userId:req.session.userId})

//         res.render('user/home', { 
//             categories,
//             products,
//             userId : req.session.userId ,
            
//         }); 

//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).send('Server Error');
//     }
// };



const loadHome = async (req, res) => {
    try {
        const categories = await category.find({ listed: true });

        const products = await productsmodel.find({ listed: true });

    
        const cart = await cartSchema.findOne({ userId: req.session.userId })
            .populate('items.productId') 
            .exec();

       
        let cartTotalPrice = 0;
        if (cart && cart.items.length > 0) {
            cartTotalPrice = cart.items.reduce((total, item) => {
                return total + (item.productId.price * item.quantity);
            }, 0);
        }

        res.render('user/home', {
            categories,
            products,
            userId: req.session.userId,
            cart: cart ? cart.items : [],  
            cartTotalPrice  
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server Error');
    }
};


const LoadProductDetails = async (req, res) => {
    try {
console.log("not here");

        const productId = req.params.id;

        if(!productId) return res.redirect('/home')

        const cart = await cartSchema.findOne({ userId: req.session.userId })
        .populate('items.productId')
        .exec();

    
        const categories = await category.find({ listed: true });

        const product = await productsmodel.findById(productId); 

        const relatedProducts = await productsmodel.find({

            category: product.category,
            _id: { $ne: productId } 

        }).limit(8);

        res.render('user/product-details', { product ,categories ,relatedProducts,userId :req.session.userId,cart});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};




module.exports = {
    loadHome,
    LoadProductDetails
};
