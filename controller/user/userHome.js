const categorySchema = require('../../model/category')
const productsmodel = require('../../model/products');
const cartSchema = require('../../model/cart')
const offerSchema = require('../../model/offers');
const category = require('../../model/category')
const orderSchema = require('../../model/order');
const order = require('../../model/order');
const mongoose = require('mongoose')







const loadHome = async (req, res) => {
    try {
        const categories = await categorySchema.find({ listed: true });

        let products = (await productsmodel.find({ listed: true }).populate('category')).filter(item => item.category.listed === true)
        


        const categoryIds = categories.map(item => item._id)        
 
        const productIds = products.map(item => item._id)


        const offProducts = await offerSchema.find(
            {applicableFor:{$in:productIds}}
        )

        const categoryoff = await offerSchema.find({
            applicableFor:{$in:categoryIds}
        })
        

        
        // const categoryCount = {}
        // categoryoff.forEach(offer => {
        //     const productId = offer.applicableFor.toString();
        //     categoryCount[productId] = (categoryCount[productId] || 0) + 1; 
        // })
        
        // const multipleOffersProductIds = Object.keys(categoryCount).filter(id => categoryCount[id] > 1);
        // const multipleOffers = categoryoff.filter(offer => multipleOffersProductIds.includes(offer.applicableFor.toString()));
        // console.log(multipleOffers);

        // findBestoff(categoryoff,categoryIds)
         
        res.render('user/home', {
            categories,
            products,
            userId: req.session.userId,
            offProducts,
            categoryoff
            });

    } catch (error) {
        console.error('Error in load home data:', error);
        res.status(500).send('Server Error');
    }
};





const LoadProductDetails = async (req, res) => {
    try {
console.log("not here");

        const productId = req.params.id;

        if(!productId) return res.redirect('/home')

        

    
        const categories = await categorySchema.find({ listed: true });

        const product = await productsmodel.findById(productId); 

        const relatedProducts = await productsmodel.find({

            category: product.category,
            _id: { $ne: productId } 

        }).limit(8);

        const offers = await offerSchema.find({offType:'product'}) 
        const asOffer = offers.find(item => item.applicableFor.toString() === productId.toString())


        res.render('user/product-details', { product ,categories ,relatedProducts,userId :req.session.userId,asOffer});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};



const search = async (req,res) => {
    try {
        const {searchQuary} = req.body
        
        const products = await productsmodel.find(
            {$and:[
                {productName:{$regex: new RegExp(searchQuary,'i')}},
                {listed: true}
            ]}
        )
        
        req.session.searchedProucts = products 
            
        res.redirect('/search-proudct')

       
       
    } catch (error) {
        console.log(`error from search product : ${error}`);
    }
}



const loadSearch = async (req,res) => {
    try {

        const categories = await category.find({ listed: true });

        const products = req.session.searchedProucts

        res.render('user/search-result',{
            categories,
            userId: req.session.userId,
            products
        })
    } catch (error) {
        console.log(`error from load search ${error}`);
    }
}


const loadCategory = async (req,res) => {
    try {
        const categoryName = req.params.categoryName

        const products = await productsmodel.find({category:categoryName,listed:true}).populate('category')
        const categories = await categorySchema.find({listed:true})
        const category = categories.find(item => item._id.toString() === categoryName)
        
        

        
        
        res.render('user/category',{products,categories,userId: req.session.userId,category})
    } catch (error) {
        console.log(`error form load caterfory : ${error}`);
    }
}





const filterCategory = async (req, res) => {
    try {
        const { selectedValues, category } = req.body;
        const categoryId = new mongoose.Types.ObjectId(category);

        const pipeline = [
            { $match: { category: categoryId, listed: true } }
        ];

        if (selectedValues.sort) {
            const sortField = selectedValues.sort === 'A - Z' ? 1 : selectedValues.sort === 'Z - A' ? -1 : null;
            if (sortField !== null) {
                pipeline.push({ $sort: { productName: sortField } });
            }
        }

        if (selectedValues.price) {
            const priceOrder = selectedValues.price === 'High to Low' ? -1 : selectedValues.price === 'Low to High' ? 1 : null;
            if (priceOrder !== null) {
                pipeline.push({ $sort: { price: priceOrder } });
            }
        }

        const products = await productsmodel.aggregate(pipeline);

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.log(`Error from category filter: ${error}`);
    }
};



const filterSearch = async (req,res) => {
    try {
        const {filterValue} = req.body
        
        const products = req.session.searchedProucts

        let filterProducts 
        
        if(filterValue === 'popular'){
            const productIds = products.map(item => item._id)

            const orders = await orderSchema.find({'products.productId':{$in:productIds}})
            
            const popularity = {}
            productIds.forEach(id => {
                popularity[id] = 0
            })

            orders.forEach(item =>{
                item.products.forEach(product => {
                    if(product.productId in popularity){
                        popularity[product.productId] += product.quantity
                    }
                })
            })

            const popular = Object.entries(popularity).sort((a,b) => (b[1] - a[1])).slice(0,5).map(entry => entry[0])
            
            filterProducts = await productsmodel.find({_id:{$in:popular},listed:true})

        }else if(filterValue === 'uder100'){
            filterProducts = products.filter(item => item.price <= 100)
        }else if(filterValue === 'above100'){
            filterProducts = products.filter(item => item.price >= 100)
        }else if(filterValue === 'A-Z'){
            filterProducts = products.sort((a, b) => {
                if (a.productName.toLowerCase() < b.productName.toLowerCase()) {
                  return -1;
                }
                if (a.productName.toLowerCase() > b.productName.toLowerCase()) {
                  return 1;
                }
                return 0;
            })
        }else if(filterValue === 'Z-A'){
            filterProducts = products.sort((a, b) => {
                if (a.productName.toLowerCase() < b.productName.toLowerCase()) {
                  return 1;
                }
                if (a.productName.toLowerCase() > b.productName.toLowerCase()) {
                  return -1;
                }
                return 0;
            })
        }else if(filterValue === 'hign-low'){
            filterProducts = products.sort((a,b) => b.price - a.price)
        }else if(filterValue === 'low-high'){
            filterProducts = products.sort((a,b) => a.price - b.price)
        }
        
        res.status(200).json({success:true,filterProducts})
        
    } catch (error) {
        console.log(`error from filter  search ${error}`);
    }
}


module.exports = {
    loadHome,
    LoadProductDetails,
    search,
    loadSearch,
    loadCategory,
    filterCategory,
    filterSearch
};
