let cropper;
let currentImageNumber;
let imageBlobs = {};




function showCropper(event, imageNumber) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const cropImage = document.getElementById('cropImage');
            cropImage.src = e.target.result;

           
            currentImageNumber = imageNumber;

            document.getElementById('cropModal').style.display = 'flex';

            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(cropImage, { aspectRatio: 1, viewMode: 1 });
        };
        reader.readAsDataURL(file);
    }
}




function cropImage() {
    const croppedCanvas = cropper.getCroppedCanvas();
    croppedCanvas.toBlob(function (blob) {
        if (blob) {
            imageBlobs[currentImageNumber] = blob;
        } else {
            console.error('Failed to create Blob.');
        }

        const croppedImage = document.getElementById('productImage' + currentImageNumber);
        croppedImage.src = croppedCanvas.toDataURL();
        closeCropModal();
    });
}





function closeCropModal() {
    document.getElementById('cropModal').style.display = 'none';
    cropper.destroy();
}



async function submitProduct(isEditMode, productId = null) {

    const url = isEditMode && productId ? `/admin/edit-product/${productId}` : '/admin/add-product';

    let name = validateName()
    let brand = validateBrand()
    let price = validatePrice()
    let ingredients = validateingredients()
    let stock = validateStock()
    let category = validateCategory()
    let description = validateDescription()
    let images = validateImages(isEditMode);

    if(!name || !brand || !price  || !stock || !category || !description || !images || !ingredients){
        console.log('Validation failed');
        return ;
    }



    const formData = new FormData();
    formData.append('productName', document.getElementById('productName').value);
    formData.append('brand', document.getElementById('brand').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('ingredients', document.getElementById('ingredients').value);
    formData.append('quantity', document.getElementById('stockCount').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);


  
   
    // for (let i = 1; i <= 3; i++) {
    //     const blob = imageBlobs[i];
    //     if (blob) {
    //         formData.append('images', blob, `productImage${i}.png`) 
    //     }
    // }
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

for (let i = 1; i <= 3; i++) {
    const blob = imageBlobs[i]; // Assuming imageBlobs contains blobs for images.
    if (blob) {
        const fileType = blob.type.split('/')[1]; // Get the file extension (e.g., 'png', 'jpeg')
        if (allowedExtensions.includes(fileType)) {
            formData.append('images', blob, `productImage${i}.${fileType}`);
        } else {
            console.warn(`Unsupported file type for blob at index ${i}`);
        }
    }
}
    

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = '/admin/products';
        } else {
            alert(data.message || 'Failed to submit product.');
        }
    } catch (error) {
        console.error('Error found from fetch:', error);
        alert('Failed to submit product.');
    }
}






let nameError = document.getElementById('nameErrore')
let brandError = document.getElementById('brandErrore')
let priceErrore = document.getElementById('priceErrore')
let ingredientErrore = document.getElementById('ingredientErrore')
let stockErrore = document.getElementById('stockErrore')
let categoryErrore = document.getElementById('categoryErrore')
let DescriptionErrore = document.getElementById('DescriptionErrore')



function validateName() {
    let name = document.getElementById('productName').value
    let regex = /^[^\W\d][\s\S]*$/

    console.log("name will work");
    
    if(!regex.test(name)){
        nameError.innerHTML = 'Invalid product name: The name can only contain letters, numbers'
        return false
    }
    nameError.innerHTML = ''
    return true
}


function validateBrand() {
    let brand = document.getElementById('brand').value
    let regex = /^[^\W\d][\s\S]*$/

    if(!regex.test(brand)){
        brandError.innerHTML = 'Invalid Brand name: The name can only contain letters, numbers'
        return false
    }
    brandError.innerHTML = ''
    return true
}


function validatePrice() {
    let price = document.getElementById('price').value
    let regex = /^\d+(\.\d{1,2})?$/

    if(!regex.test(price)){
        priceErrore.innerHTML = 'Please enter a valid non-negative price.'
        return false
    }else if(price<15){
        priceErrore.innerHTML = 'The price must be at least 15.'
        return false
    }
    priceErrore.innerHTML = ''
    return true
}

function validateingredients() {
    let ingredients = document.getElementById('ingredients').value;
    let regex = /^[^\W\d][\s\S]*$/;

    if (!regex.test(ingredients)) {
        ingredientErrore.innerHTML = 'The input must start with a letter and can contain letters, numbers, and common punctuation.';
        return false;
    }
    ingredientErrore.innerHTML = '';
    return true;
}


function validateStock() {
    let stock = document.getElementById('stockCount').value
    let regex = /^\d+(\.\d{1,2})?$/

    if(!regex.test(stock)){
        stockErrore.innerHTML = 'Please enter a valid non-negative Stock.'
        return false
    }
    stockErrore.innerHTML = ''
    return true
}

function validateDescription() {
    validateCategory()
    let description = document.getElementById('description').value
    let regex = /^[A-Za-z][\s\S]{49,}$/

    if(!regex.test(description)){
        DescriptionErrore.innerHTML = 'Description must start with a letter and be at least 50 characters long.'
        return false
    }
    DescriptionErrore.innerHTML = ''
    return true
}


function validateCategory(){
    let category = document.getElementById('category').value

    if(category === ''){
        categoryErrore.innerHTML = 'Please select a category.'
        return false
    }
    categoryErrore.innerHTML = ''
    return true
}


function validateImages(isEditMode) {
    if(!isEditMode){
        let image1 = document.getElementById('imageUpload1').files[0];
        let image2 = document.getElementById('imageUpload2').files[0];
        let image3 = document.getElementById('imageUpload3').files[0];

        if (!image1 || !image2 || !image3) {
            document.getElementById('imageError').innerHTML = 'Please upload all three images.';
            return false;
        }

        document.getElementById('imageError').innerHTML = '';
        return true;
    }else{
        return true;
    }
}

document.getElementById('submit-btn').addEventListener('click', (event) => {
    event.preventDefault();
});

