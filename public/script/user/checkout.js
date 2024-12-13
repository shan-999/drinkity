const addressDropdown = document.getElementById('options-dropdown');
const addressDisplay = document.getElementById('address-display');

addressDropdown.addEventListener('change', async (event) => {
    const selectedAddressId = event.target.value;

    try {
        const response = await axios.get(`/select-addesses/${selectedAddressId}`);
        const address = response.data;

        addressDisplay.innerHTML = `
            <address>
                ${address.fullName}<br />
                ${address.address},<br />
                ${address.city}, ${address.state}, ${address.PINCode},<br />
                ${address.PINCode}, ${address.landmark}
            </address>
        `;
    } catch (error) {
        console.error('Error fetching address:', error);
    }
});



    document.getElementById('order-form').addEventListener('submit', async  (event) => {
    event.preventDefault();


    const selectAddress = document.getElementById('options-dropdown').value

    if (selectAddress === 'select address') {
        Swal.fire('Error', 'Please select a valid address or choose the Custom option.', 'error');
        return; 
    }
    
    let addresData;

    if (selectAddress === 'custom') {
        const fullName = document.getElementById('fullName').value.trim();
        const address = document.getElementById('coustome-address').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobileNumber = document.getElementById('mobile').value.trim();
        const city = document.getElementById('city').value.trim();
        const postcode = document.getElementById('postcode').value.trim();
        const state = document.getElementById('state').value.trim();
        const landmark = document.getElementById('landmark').value.trim();

        if (!fullName || !address || !email || !mobileNumber || !city || !postcode || !state || !landmark) {
            Swal.fire('Error', 'Please fill in all required fields for the custom address.', 'error');
            return; 
        }

        addresData = {
            custom: true,
            fullName: fullName,
            address: address,
            email: email,
            phonNumber: mobileNumber,
            city: city,
            PINCode: postcode,
            state: state,
            landmark: landmark
        };
    } else {
        addresData = {
            custom: false,
            id: selectAddress
        };
    }
    
    const products = Array.from(document.querySelectorAll('input[name^="products"]')).reduce((acc, input) => {
        const matches = input.name.match(/^products\[(\d+)]\[(\w+)]$/);
        if (!matches) return acc;

        const [, index, field] = matches;
        acc[index] = acc[index] || {};
        acc[index][field] = input.value || ''; 
        return acc;
    }, []); 



    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value 
    
    
    
    const totalPrice = parseFloat(document.getElementById('total').textContent.replace(/[^0-9.-]/g, ''))
    

    if (!addresData || !paymentMethod || !totalPrice || products.some(product => !product.productName || !product.price || !product.quantity || !product.productTotalPrice)) {
        Swal.fire('Error', 'Please fill in all the required fields.', 'error');
        return;
    }


    let formData = {
        address: addresData,
        products, 
        paymentMethod,
        totalPrice,
        PaymentStatus:'Pending'
    };




    try {
        if (paymentMethod === 'Razorpay') {
        try {
            const response = await axios.post('/create-razourpay-order', { amount: Math.ceil(Number(totalPrice) * 100)});
            const order = response.data;

            const options = {
            key: "rzp_test_pp5Ul8PxlHsCpL",
            amount: order.amount,
            currency: "INR",
            name: "Your Shop",
            description: "Purchase Description",
            order_id: order.id,
            handler: async (response) => {
                try {
                const verifyResponse = await axios.post('/verify-payment', response)
                    .then(res => {
                        
                        if(res.data.success){
                            formData.PaymentStatus = 'Success'
                            
                            axios.post('/confirm-order', formData ,{
                            headers: {
                                'Content-Type': 'application/json'
                            }
                            }).then((response)=>{

                            
                                sessionStorage.removeItem('code')
                                
                                const data = response.data;
                                console.log(data);
                                

                            if (data.showAlert) {
                            Swal.fire('Error', data.message, 'error');
                            } else if (data.redirect) {
                            window.location.href = data.redirect;
                            } else {
                            Swal.fire('Success', data.message, 'success');
                            }

                            })

                            

                        }
                    })
                } catch (error) {
                console.error('Payment verification failed:', error);
                alert('Payment verification failed.');
                }
            }
            };

            const rzp = new Razorpay(options);

            rzp.on('payment.failed', function (response) {
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: 'Your payment failed. Please try again.',
                })
                .then(response => {
                    formData.PaymentStatus = 'Failed'
                            
                    axios.post('/confirm-order', formData ,{
                    headers: {
                        'Content-Type': 'application/json'
                    }
                    }).then((response)=>{

                    
                        sessionStorage.removeItem('code')
                        
                        const data = response.data;
                        

                    if (data.showAlert) {
                    Swal.fire('Error', data.message, 'error');
                    } else if (data.redirect) {
                    window.location.href = '/cart'
                    } else {
                    Swal.fire('Success', data.message, 'success');
                    }

                    })

                    

                })
            
               
            });
    


            rzp.open();


        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            Swal.fire('Error', 'Failed to initiate Razorpay payment.', 'error');
        }
        } else {
        try {
            formData.PaymentStatus = "Success"
            const response = await axios.post('/confirm-order', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
            });

            const data = response.data;
            
            sessionStorage.removeItem('code')

            if (data.showAlert) {
            Swal.fire('Error', data.message, 'error');
            } else if (data.redirect) {
            window.location.href = data.redirect;
            } else {
            Swal.fire('Success', data.message, 'success');
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            Swal.fire('Error', 'Something went wrong while confirming the order.', 'error');
        }
        }


        
    } catch (error) {
        console.log(error.message);
        Swal.fire('Error', error.response.data.message, 'error');
        console.error('Error:', error);
    }
});



document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('options-dropdown').addEventListener('change', function () {
        const customAddressForm = document.getElementById('custom-address-form');
        
        if (this.value === 'custom') {
            customAddressForm.style.display = 'block';
        } else {
            customAddressForm.style.display = 'none';
        }
    });
});


const overlay = document.getElementById("modalOverlay");


document.getElementById('showCoupons').addEventListener('click', () => {
    document.getElementById('couponsModal').style.display = 'flex';
    overlay.style.display = "block";
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('couponsModal').style.display = 'none';
    overlay.style.display = "none";
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('couponsModal');
    if (event.target === overlay) {
        modal.style.display = 'none';
        overlay.style.display = "none";
    }
});




function copyCode(code,button) {
    const tempInput = document.createElement("input");
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); 
    document.execCommand("copy");
    document.body.removeChild(tempInput);


    const messageElement = button.nextElementSibling; 
    messageElement.textContent = "Copied!";
    messageElement.style.color = "#28a745"; 

    setTimeout(() => {
        messageElement.textContent = "";
    }, 2000);

}



document.getElementById('apply-btn').addEventListener('click',() => {
    const code = document.getElementById('code').value
    const errorMessage = document.getElementById('coupon-error')
    if(code.length <= 0){
        errorMessage.innerHTML = 'Please enter a coupen code'
        return false
    }
    errorMessage.innerHTML = ''

    const totalPriceElement = document.getElementById('totol-price')
    const discountElement = document.getElementById('discount')
    const shippingFeeElement = document.getElementById('shippingFee')
    const totalElement = document.getElementById('total')

    const totalPrice = parseFloat(totalPriceElement.textContent.replace(/[^0-9.-]/g, ''))
    const discount = parseFloat(discountElement.textContent.replace(/[^0-9.-]/g, ''));


    axios.post('/apply-coupon',{code,discount,totalPrice})

    .then(response => {

        if(response.data.success){
            const discount = (response.data.totalDiscount).toFixed(2)
            const shippingFee = parseFloat(shippingFeeElement.textContent.replace(/[^0-9.-]/g, ''))
            const totalPrice = parseFloat(totalPriceElement.textContent.replace(/[^0-9.-]/g, ''))
            console.log(discount,shippingFee,totalPrice);
            
            const total = (totalPrice - discount + shippingFee).toFixed(2)
            
            document.getElementById('discount').innerHTML =` ₹${discount}`
            
            document.getElementById('coupon-pending').style.display = 'none'
            document.getElementById('coupen-success').style.display = 'flex'
            document.getElementById('coupon-discount').innerHTML =` ₹${discount}`
            
            discountElement.innerHTML = -discount
            totalElement.innerHTML = `₹${total}`
            
            Swal.fire({
                title: 'Coupon added success',
                text: response.data.message ,
                icon: 'success',
                confirmButtonText: 'Okay'
            })
            
            sessionStorage.setItem('code',code)
        }
        
    })
    .catch(error => {
        console.log(error);
        
        Swal.fire({
            title: 'Error!',
            text: error.response.data.message || 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonText: 'Okay'
        });

    })
    
    
})





document.getElementById('remove-coupon').addEventListener('click', () => {

    const shippingFeeElement = document.getElementById('shippingFee')
    const totalPriceElement = document.getElementById('totol-price')
    
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to Remove this coupon?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, confirm!',
        cancelButtonText: 'Cancel'
    }).then(response => {
        if(response.isConfirmed){

            const code = sessionStorage.getItem('code')

            axios.post('/remove-coupon',{code})
            .then(res => {
                console.log(res);
                
                if(res.data.success){
                    const discount = 0
                    const shippingFee = parseFloat(shippingFeeElement.textContent.replace(/[^0-9.-]/g, ''))
                    const totalPrice = parseFloat(totalPriceElement.textContent.replace(/[^0-9.-]/g, ''))

                    const total = (shippingFee + totalPrice).toFixed()


                    document.getElementById('total').innerHTML = `₹${total}`
                    document.getElementById('discount').innerHTML = -0

                    document.getElementById('coupon-pending').style.display = 'flex'
                    document.getElementById('coupen-success').style.display = 'none'

                    

                    Swal.fire({
                        title: ' removed ',
                        text: 'Coupon removed successfully' ,
                        icon: 'success',
                        confirmButtonText: 'Okay'
                    })
                    sessionStorage.removeItem('code')


                }
            })
        }
    })
    
})