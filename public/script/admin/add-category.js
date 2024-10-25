// // let nameError = document.getElementById('name-error')


// // function validateName(){
// //     let field = document.getElementById('categoryName').value
// //     let regex = /^[A-Za-z ]+$/
// //     console.log('function called');
    
// //     if(!regex.test(field)){
// //         nameError.innerHTML = 'Invalid input: Only alphabetic characters are allowed.'
// //         return false
// //     }
// //     nameError.innerHTML = ""
// //     return true
// // }


// // async function submitEditCategoryForm(event) {
// //   event.preventDefault(); // Prevent form submission

// //   // Validate the category name
// //   if (!validateName()) {
// //     Swal.fire({
// //       icon: 'error',
// //       title: 'Invalid Input',
// //       text: 'Only alphabetic characters are allowed in the category name!',
// //     });
// //     return;
// //   }

// //   // Get form data
// //   const formData = new FormData(document.getElementById('category-form'));
  
// //   try {
// //     // Send form data to the backend using fetch API
// //     const response = await fetch('/admin/add-category', {
// //       method: 'POST',
// //       body: formData,
// //     });

// //     const result = await response.json();

// //     if (result.success) {
// //       Swal.fire({
// //         icon: 'success',
// //         title: 'Success',
// //         text: result.message,
// //       }).then(() => {
// //         window.location.href = '/admin/category'; // Redirect after success
// //       });
// //     } else {
// //       Swal.fire({
// //         icon: 'error',
// //         title: 'Error',
// //         text: result.message, // Display backend error message (e.g., duplicate name or not found)
// //       });
// //     }
// //   } catch (error) {
// //     Swal.fire({
// //       icon: 'error',
// //       title: 'Server Error',
// //       text: 'Something went wrong, please try again later.',
// //     });
// //   }
// // }

// // // Add event listener for form submission
// // document.getElementById('category-form').addEventListener('submit', submitEditCategoryForm);




let nameError = document.getElementById('name-error');

function validateName() {
  let field = document.getElementById('categoryName').value;
  let regex = /^[A-Za-z ]+$/;

  if (!regex.test(field)) {
    nameError.innerHTML = 'Invalid input: Only alphabetic characters are allowed.';
    return false;
  }
  nameError.innerHTML = "";
  return true;
}

// async function submitCategoryForm(event, isEdit = false) {
//   event.preventDefault();

//   if (!validateName()) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Invalid Input',
//       text: 'Only alphabetic characters are allowed in the category name!',
//     });
//     return;
//   }

//   const form = event.target;
//   const formData = {
//     name: form.elements['categoryName'].value,
//     id: form.elements['categoryId'] ? form.elements['categoryId'].value : undefined,
//   };

//   try {
//     const url = isEdit ? '/admin/edit-category' : '/admin/add-category';
//     console.log(formData);

//     const response = await axios.post(url, formData);

//     if (response.data.success) {
//       Swal.fire({
//         icon: 'success',
//         title: 'Success',
//         text: response.data.message,
//       }).then(() => {
//         window.location.href = '/admin/category';
//       });
//     } else {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: response.data.message,
//       });
//     }
//   } catch (error) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Server Error',
//       text: 'Something went wrong, please try again later.',
//     });
//   }
// }

document.getElementById('category-form')?.addEventListener('submit', (e) => submitCategoryForm(e, false));
document.getElementById('edit-category-form')?.addEventListener('submit', (e) => submitCategoryForm(e, true));



async function submitCategoryForm(event, isEdit = false) {
    event.preventDefault();
  
    if (!validateName()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Only alphabetic characters are allowed in the category name!',
      });
      return;
    }
  
    const form = event.target;
    const formData = {
      name: form.elements['categoryName'].value,
      id: form.elements['categoryId'] ? form.elements['categoryId'].value : undefined,
    };
  
    try {
      const url = isEdit ? '/admin/edit-category' : '/admin/add-category';
      console.log(formData);
  
      const response = await axios.post(url, formData);
  
      // Handle success response.
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data.message,
      }).then(() => {
        window.location.href = '/admin/category';
      });
  
    } catch (error) {
      // Check if it's a custom error message from the server.
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response.data.message,
        });
      } else {
        // Handle server or network errors.
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Something went wrong, please try again later.',
        });
      }
    }
  }
  



  