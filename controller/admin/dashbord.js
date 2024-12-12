const orderSchema = require('../../model/order')
const products = require('../../model/products')
const userSchema = require('../../model/userModel')
const moment = require('moment');


const loadDashbord = async (req,res) => {
    try {
        const orders = await orderSchema.find()

        const totalPrice = orders.reduce((sum,item) => sum + item.Totalprice ,0)
        const toatlOrders = await orderSchema.countDocuments()

        let productSold = 0
        const bestSellingProduct = {}
        orders.forEach(item => {
            productSold += item.products.reduce((sum,item) => sum + item.quantity,0)

            item.products.forEach(product => {
                const productName = product.productName
                bestSellingProduct[productName] = (bestSellingProduct[productName] || 0) + product.quantity
            })

        })
        const topSellingProduct = Object.entries(bestSellingProduct).sort(([,quantity1],[,quantity2]) => quantity2 - quantity1).slice(0,10)
        const bestProducts = topSellingProduct.map(([productName,quantity]) => ({productName,quantity}))


        const populatedOrders = await orderSchema.find().populate('products.productId')
        
        const sellingcategory = {}
        const sellingBrand = {}
        populatedOrders.forEach(item => {
            item.products.forEach(item => {
                const categoryName = item.productId.category
                const brandName = item.productId.brand
                sellingcategory[categoryName] = (sellingcategory[categoryName] || 0) + 1
                sellingBrand[brandName] = (sellingBrand[brandName] || 0) + 1
            })
        })

        const topSelligCategory = Object.entries(sellingcategory).sort(([,quantity1],[,quantity2]) => quantity2 - quantity1).slice(0,10)
        const bestSellingCategory = topSelligCategory.map(([categoryName,quantity]) => ({categoryName,quantity})) 
        const topSellingBrand = Object.entries(sellingBrand).sort(([,quantity1],[,quantity2]) => quantity2 - quantity1).slice(0,10)
        const bestSellingBrand = topSellingBrand.map(([brandName,quantity]) => ({brandName,quantity})) 
        
        const totalUser = await userSchema.countDocuments()

        res.render('admin/dashbord',{
            totalPrice,
            toatlOrders,
            productSold,
            totalUser,
            bestProducts,
            bestSellingCategory,
            bestSellingBrand
        })
    } catch (error) {
        console.log(`error form load dashboard ${error}`);
    }
}


const loadChart = async (req,res) => {
    try {

        const datas = await getFilteredData('yearly')
        console.log(datas);
        

        const labels = Object.keys(datas)
        const data = Object.values(datas)
        
        res.status(200).json({labels,data})
    } catch (error) {
        console.log(`error from load chart ${error}`);
    }
}


const filterChart = async (req,res) => {
    try {
        const {filterBy} = req.body
        
        const datas = await getFilteredData(filterBy)

        const labels = Object.keys(datas)
        const data = Object.values(datas)
        
        res.status(200).json({labels,data})
        
    } catch (error) {
        console.log(`error from fiter chart ${error}`);
    }
}


async function getFilteredData (value) {
    const orders = await orderSchema.find()

    if(value === 'yearly'){
        return orders.reduce((ac, item) => {
            const year = moment(item.orderDate).year()
            ac[year] = (ac[year] || 0) + item.Totalprice
            return ac
        }, {})
    }else if(value === 'monthly'){
        return orders.reduce((ac, item) => {
            const month = moment(item.orderDate).format('YYYY-MM')
            ac[month] = (ac[month] || 0) + item.Totalprice
            return ac
        }, {})
    }else if(value === 'weekly'){
        return orders.reduce((acc, item) => {
            const date = new Date(item.orderDate)
            const week = `Year ${date.getFullYear()} - Week ${moment(date).isoWeek()}`
            acc[week] = (acc[week] || 0) + item.Totalprice
            return acc
        }, {});
    }

}


module.exports = {
    loadDashbord,
    loadChart,
    filterChart
}