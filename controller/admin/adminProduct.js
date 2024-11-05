const products = require('../../model/products'); 
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path'); 
const categorys = require('../../model/category')


const loadProducts = async (req, res) => {
    try {
        const adminId = req.session.adminId;
        if (!adminId) return res.redirect('/admin/login?message=Something went wrong');

        const page = parseInt(req.query.page) || 1; 
        const limit = 4; 
        const skip = (page - 1) * limit;

        const product = await products.find({}).skip(skip).limit(limit);
        
            

        const totalProducts = await products.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);


        res.render('admin/product', { product: product , page, totalPages});
    } catch (error) {
        console.log(`this error from load product : ${error}`);
        
    }
};


const loadAddProduct = async (req, res) => {
    try {
        const categories = await categorys.find();  
        res.render('admin/add-product', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


const loadEditProduct = async (req, res) => {
    try {
        const product = await products.findById(req.params.id);
        const categories = await categorys.find(); 

        if (product) {
            res.render('admin/edit-prodect', { product, categories });
        } else {
            res.status(404).send('Product not found');
        }

    } catch (error) {
        res.status(500).send('Server Error');
        console.log(`Error fetching product: ${error}`);
    }
};



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
        console.log('Storage: File upload path set.');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
        console.log('Storage: Filename generated.');
    }
});


const upload = multer({ storage: storage }); 


const addProduct = async (req, res) => {
    try {
        console.log('Processing addProduct request.');
        
        const { productName, brand, price, ingredients, quantity, category ,description} = req.body;

        console.log(productName, brand, price,ingredients, quantity, category ,description);
        

        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        const newProduct = new products({ 
            productName,
            brand,
            price,
            ingredients,
            quantity,
            category,
            description,
            images: imagePaths 
        });

        await newProduct.save();
        console.log('Product added successfully.');

        res.status(201).json({ 
            success: true, 
            message: 'Product added successfully!' 
        });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding product' 
        });
    }
};






const editProduct = async (req, res) => {
    try {
        const { productName, brand, price, ingredients, quantity, category ,description} = req.body;
        const productId = req.params.id;
        
        
        const product = await products.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

       
        product.productName = productName;
        product.brand = brand;
        product.price = price;
        product.ingredients = ingredients
        product.quantity = quantity;
        product.category = category;
        product.description = description

        
        let updatedImages = [...product.images];  

        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                const newImagePath = `/uploads/${file.filename}`;
                updatedImages[index] = newImagePath;
            });
        }

        product.images = updatedImages;


        await product.save();

        res.status(200).json({ success: true, message: 'Product updated successfully!' });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Error updating product' });
    }
};



const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;  
        console.log(id);

        
        const product = await products.findByIdAndDelete(id);
        console.log(product);
       
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
        
    } catch (error) {
        console.error(`Error in deleteProduct: ${error}`);
        res.status(500).json({ message: 'Server error' });
    }
};


const editStatus = async (req,res) => {
    const {prodectId} = req.body
    const action = req.params.action
    console.log(prodectId,action);
    
    try {
        const product = await products.findById(prodectId);
        if (!product) return res.json({ success: false, message: 'product not found' });
    
        if (action === 'list') {
          product.listed = true;
        } else if (action === 'unlist') {
          product.listed = false;
        }
    
        await product.save();
        return res.json({ success: true ,message: "Status edit success"});
      } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error occurred' });
      }

}


module.exports = {
    loadProducts,
    loadAddProduct,
    loadEditProduct,
    addProduct,
    upload, // Reused for both adding and editing products
    editProduct,
    deleteProduct,
    editStatus
};
