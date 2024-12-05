const order = require('../../model/order')
const orderSchema = require('../../model/order')
const moment = require('moment')
const ExcelJS = require("exceljs")
const PDFDocument = require("pdfkit")
const path = require("path")
const fs = require("fs")






const loadSalesReport = async (req,res) => {
    
    const orders = await orderSchema.find({}) 
    
    const totalAmount = orders.reduce((acc,item) => acc + item.Totalprice,0) 
    const totalDiscount = orders.reduce((acc,item) => acc + item.totalOfferPrice + ( item.coupenApplied && item.coupenApplied.discount ? item.coupenApplied.discount : 0) ,0)

    res.render('admin/dashboard',{orders,totalAmount,totalDiscount})
}



const filterSalesReport = async (req,res) => {
    try {
        const {startDate,endDate,filterValue} = req.body


        if(filterValue === 'costom'){
            
            const orders = await orderSchema.find({
                orderDate:{
                    $gte: startDate,
                    $lte: endDate
                }
            })
            return res.status(200).json({sucees:true,orders})
        }



        let start 
        let end
        const currentDate = moment()

        switch(filterValue){
            case 'today' :
                start = currentDate.clone().startOf('day')
                end = currentDate.clone().endOf('day')
                break;  
            case 'this-week' :
                start = currentDate.clone().startOf('week').utc()
                end = currentDate.clone().endOf('week').utc()
                break
            case 'this-month' :
                start = currentDate.clone().startOf('month')
                end = currentDate.clone().endOf('month')
                break
            case 'this-year' :
                start = currentDate.clone().startOf('year')
                end = currentDate.clone().endOf('year')
                break
            default:
                return res.status(400).json({success:false})
        }

        console.log("Start Date:", start.toDate());
        console.log("End Date:", end.toDate());
        const orders = await orderSchema.find({
            orderDate:{
                $gte: new Date(start),
                $lte: new Date(end),
            }
        })
        console.log(orders);
        

        return res.status(200).json({success:true,orders})
        

        
    } catch (error) {
        console.log(`error from filter sales report : ${error}`);
        
    }
}


const dowloadPDF = async (req,res) => {
    try {
        const {data} = req.body
                
        const doc = new PDFDocument()


        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=drinkity-sales-report.pdf')

        doc.pipe(res)

        doc.fontSize(16).text('Sales Report', { align: 'center' });
        doc.moveDown(1.5)

        const tableTop = 100
        const rowHeight = 25
        const columnSpacing = 5
        const columnWidth = 80


        const headers = Object.keys(data[0])
        let x = 50
        let y = tableTop

        

        headers.forEach((header) => {
            doc
                .fontSize(10)
                .text(header, x, y, { width: columnWidth, align: 'center' });
            x += columnWidth + columnSpacing;
        })

        doc
            .moveTo(50, y + rowHeight - 10)
            .lineTo(50 + headers.length * (columnWidth + columnSpacing) - columnSpacing, y + rowHeight - 10)
            .stroke()

            

        y += rowHeight
        data.forEach((row) => {
            x = 50; 
            Object.values(row).forEach((cell) => {
                doc
                    .fontSize(8)
                    .text(String(cell), x, y, { width: columnWidth, align: 'center' ,ellipsis: true});
                x += columnWidth + columnSpacing;
            });
            y += rowHeight;

            doc
                .moveTo(50, y - 10)
                .lineTo(50 + headers.length * (columnWidth + columnSpacing) - columnSpacing, y - 10)
                .stroke();
        })

        doc.end()
        
    } catch (error) {
        console.log(`error form dowload pdf ${error}`);
        
    }
}


const dowloadExcel = async (req,res) => {
    try {
        const {data} = req.body
    
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Orders")

        worksheet.columns = [
            { header: "Order ID", key: "orderId", width: 30 },
            { header: "Total Amount", key: "totalAmount", width: 15 },
            { header: "Coupon Discount", key: "couponDiscount", width: 20 },
            { header: "Offer Discount", key: "offerDiscount", width: 20 },
            { header: "User Email", key: "userEmail", width: 30 },
            { header: "Order Date", key: "orderDate", width: 15 },
        ]
        
        data.forEach((order) => {
            worksheet.addRow(order);
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=drinkity-sales-report.xlsx");
    
        await workbook.xlsx.write(res);
        res.end();
        console.log('hell');
        
    } catch (error) {
        console.log(`error form dowload excel file : ${error}`);
        
    }
}



module.exports = {
    loadSalesReport,
    filterSalesReport,
    dowloadPDF,
    dowloadExcel
}