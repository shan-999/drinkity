
function updateCart(productId,event,from){
    
    event.preventDefault()
    let quantityElement = document.getElementById('quantity')
    let quantity = quantityElement ? quantityElement.value : 1

    let price = 0
    if(from === 'product'){
        price = parseFloat((document.getElementById('price').textContent).replace(/[^\d.]/g, ''))
    }else if(from === 'wishlist'){
        price = event.target.getAttribute('data-price')
    }
    console.log(price);
    
    

    axios.post('/addtocart', { productId, quantity ,price})
    .then(response => {

        if (response.status === 200) {
            Swal.fire(
                'Added to cart',
                'Product was successfully added to cart',
                'success'
            );
        } else {
            console.log(response.data.message)
            Swal.fire(
                'Error!',
                response.data.message || 'Failed to add to cart',
                'error'
            );
        }
    })
    .catch(error => {
        if (error.response && error.response.status === 401) {
            Swal.fire(
                'Error!',
                error.response.data.message || 'You need to log in first',
                'error'
            );
        } else {
            Swal.fire(
                'Error!',
                error.response.data.message || 'Failed to add to cart. Please try again.',
                'error'
            );
        }
    });
}




    
