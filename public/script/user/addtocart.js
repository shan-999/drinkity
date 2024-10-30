
function updateCart(productId,event){
    event.preventDefault()
    let quantity = document.getElementById('quantity').value

    axios.post('/addtocart', { productId, quantity })
    .then(response => {
        console.log('Product added to cart successfully');

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




    
