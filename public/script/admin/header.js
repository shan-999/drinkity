
function confirmLogout() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out and redirected to the login page.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5e57',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, logout!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/admin/logout';
        }
    });
}
