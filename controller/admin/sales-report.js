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

    res.render('admin/sales-report',{orders,totalAmount,totalDiscount})
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
            const totalAmount = orders.reduce((acc,item) => acc + item.Totalprice,0) 
            const totalDiscount = orders.reduce((acc,item) => acc + item.totalOfferPrice + ( item.coupenApplied && item.coupenApplied.discount ? item.coupenApplied.discount : 0) ,0)

            return res.status(200).json({sucees:true,orders,totalAmount,totalDiscount})
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

        const orders = await orderSchema.find({
            orderDate:{
                $gte: new Date(start),
                $lte: new Date(end),
            }
        })

        

        const totalAmount = orders.reduce((acc,item) => acc + item.Totalprice,0) 
        const totalDiscount = orders.reduce((acc,item) => acc + item.totalOfferPrice + ( item.coupenApplied && item.coupenApplied.discount ? item.coupenApplied.discount : 0) ,0)
        

        return res.status(200).json({success:true,orders,totalAmount,totalDiscount})
        

        
    } catch (error) {
        console.log(`error from filter sales report : ${error}`);
        
    }
}


const dowloadPDF = async (req,res) => {
    try {
        const {data,totalAmount,totalSales,totalDiscount} = req.body
        
                
        const doc = new PDFDocument()


        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=drinkity-sales-report.pdf')

        doc.pipe(res)

        doc.fontSize(16).text('Sales Report', { align: 'center' });
        doc.moveDown(1.5);

        const pageHeight = 700;
        const marginTop = 50;
        const marginBottom = 50;
        const tableTop = 100;
        const rowHeight = 25;
        const columnSpacing = 5;
        const columnWidth = 80;
        let y = tableTop;

        const headers = Object.keys(data[0]);
        let x = 50;

        headers.forEach((header) => {
            doc
                .fontSize(10)
                .text(header, x, y, { width: columnWidth, align: 'center' });
            x += columnWidth + columnSpacing;
        });

        doc
            .moveTo(50, y + rowHeight - 10)
            .lineTo(50 + headers.length * (columnWidth + columnSpacing) - columnSpacing, y + rowHeight - 10)
            .stroke();

        y += rowHeight;

        function checkPageSpace(doc, currentY, heightNeeded) {
            if (currentY + heightNeeded > pageHeight - marginBottom) {
                doc.addPage();
                return marginTop; 
            }
            return currentY;
        }

        data.forEach((row) => {
            y = checkPageSpace(doc, y, rowHeight); 
            x = 50; 

            Object.values(row).forEach((cell) => {
                doc
                    .fontSize(8)
                    .text(String(cell), x, y, { width: columnWidth, align: 'center', ellipsis: true });
                x += columnWidth + columnSpacing;
            });

            y += rowHeight;

            doc
                .moveTo(50, y - 10)
                .lineTo(50 + headers.length * (columnWidth + columnSpacing) - columnSpacing, y - 10)
                .stroke();
        });

        y = checkPageSpace(doc, y, 100); 

        doc.fontSize(12).text('Summary', 50, y);
        y += 20;

        doc
            .fontSize(10)
            .text(`Total Amount: ₹${totalAmount}`, 50, y)
            .text(`Total Sales: ${totalSales}`, 50, y + 15)
            .text(`Total Discount: ₹${totalDiscount}`, 50, y + 30);

        doc.end();

        
    } catch (error) {
        console.log(`error form dowload pdf ${error}`);
        
    }
}


const dowloadExcel = async (req,res) => {
    try {
        const {data,totalAmount,totalSales,totalDiscount} = req.body
        console.log(data,totalAmount,totalSales,totalDiscount);
        
    
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
            worksheet.addRow(order)
        })

        worksheet.addRow([]);

        worksheet.addRow([
            "Summary",
        ]);

        worksheet.mergeCells(`A${worksheet.lastRow.number}:F${worksheet.lastRow.number}`)
        worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: "center" }
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true }

        worksheet.addRow(["", "Total Amount", totalAmount])
        worksheet.addRow(["", "Total Sales", totalSales])
        worksheet.addRow(["", "Total Discount", totalDiscount])

        const lastRow = worksheet.lastRow.number;
        worksheet.getRow(lastRow - 2).font = { bold: true }
        worksheet.getRow(lastRow - 1).font = { bold: true } 
        worksheet.getRow(lastRow).font = { bold: true }

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=drinkity-sales-report.xlsx")
    
        await workbook.xlsx.write(res);
        res.end();
        
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