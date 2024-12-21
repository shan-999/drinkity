const categoryModel = require('../../model/category')

const loadcategory = async (req,res) =>{
    try {
        const adminId = req.session.adminId
        if(!adminId) return res.redirect('/admin/login?message=sumthing errore')

        const page = parseInt(req.query.page) || 1; 
        const limit = 10; 
        const skip = (page - 1) * limit;
        
        const categories = await categoryModel.find().skip(skip).limit(limit)

        const totalProducts = await categoryModel.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/category',{categories:categories, totalPages, page})
    } catch (error) {
        console.log(`error from load category ${error}`);
        
    }
}

const loadAddCategory = async (req, res) => {
    try {
        res.render('admin/add-category');
    } catch (error) {
        res.status(500).send('Server error');
    }
};


const loadEditCategory = async (req, res) => {
    try {
        const categoryId = req.params._id; 
        
        const category = await categoryModel.findById(categoryId); 

        if (!category) {
            return res.status(404).send('Category not found');
        }

        
        res.render('admin/edit-category', { category });

    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).send('Server error');
    }
};


const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name);
        
        const trimmedName = name.trim().toLowerCase();

        const existingCategory = await categoryModel.findOne({
            categoryName: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({ 
                success: false, 
                message: 'Category already exists' 
            });
        }

        const newCategory = new categoryModel({
            categoryName: name,
        });
        await newCategory.save();

        return res.status(200).json({ success: true, message: 'Category added successfully' });
    } catch (error) {
        console.log(`This is from add category: ${error}`);
        res.status(500).json({
            success: false,
            message: 'Server error, please try again later.',
        });
    }
};



const editCategory = async (req, res) => {
    try {
        const { id, name } = req.body;
        let trimmedName = name.trim().toLowerCase();

        const existingCategory = await categoryModel.findOne({ _id: id });

        if (!existingCategory) {
            return res.status(404).json({ 
                success: false, 
                message: 'Category not found' 
            });
        }

        if (existingCategory.categoryName.trim().toLowerCase() === trimmedName) {
            return res.status(400).json({
                success: false,
                message: 'No changes were made, category name is the same'
            });
        }

        const duplicateCategory = await categoryModel.findOne({
            categoryName: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
            _id: { $ne: id }
        });

        if (duplicateCategory) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate category, please choose another name'
            });
        }

        await categoryModel.findOneAndUpdate(
            { _id: id },
            { $set: { categoryName: name } }
        );

        return res.status(200).json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.log(`This is from edit category: ${error}`);
        res.status(500).json({ 
            success: false, 
            message: 'Server error, please try again later.' 
        });
    }
};



const deleteCategory = async (req,res) =>{
    try {
        const {categoryId} = req.body

        const category = await categoryModel.findOneAndDelete({_id:categoryId})
        res.status(200).json({success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.log(`this is from delete category:${error}`);
    }
}


const softEditCategory = async (req,res) => {
    const {categoryId} = req.body
    const action = req.params.action
    
    try {
        const category = await categoryModel.findById(categoryId);
        if (!category) return res.json({ success: false, message: 'Category not found' });
    
        if (action === 'list') {
            category.listed = true;
        } else if (action === 'unlist') {
            category.listed = false;
        }
        
        await category.save();
        return res.json({ success: true });
      } catch (error) {
        console.error(`this is from softEditCategory : ${error}`);
        res.json({ success: false, message: 'Error occurred' });
      }
}


module.exports  = {
    loadcategory,
    loadAddCategory,
    loadEditCategory,
    addCategory,
    editCategory,
    deleteCategory,
    softEditCategory
}