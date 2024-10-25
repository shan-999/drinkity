const { response } = require("express")

function updateCart(productId,event){
    event.preventDefault()
    let quantity = document.getElementById('quantity').value

    axios.post('/addtocart',{productId,quantity})
    .then(response => {
        if(response.data){
            Swal.fire(
                'Added to cart',
                'Product will added to cart',
                'Success'
            )
            .then(() => {
                // location.reload()
            })
        }else{
            Swal.fire(
                'Error!',
                response.data.message || 'Faild to adding cart'
            )
        }
    })
    .catch(error => {
        console.error('Error addto cart :', error);
            Swal.fire(
                'Error!',
                'Failed to add to cart. Please try again.',
                'error'
            );
    })
}




    
