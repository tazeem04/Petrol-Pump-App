import Swal from 'sweetalert2';

// Clean, Amazon-style professional alerts
const Alerts = {
    // 1. Success Popup
    success: (title = "Success", text = "Operation completed successfully.") => {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            showConfirmButton: false,
            timer: 1500,
            customClass: { popup: 'rounded-4' }
        });
    },

    // 2. Error Popup
    error: (title = "Error", text = "Something went wrong!") => {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            confirmButtonColor: '#001f3f',
            customClass: { popup: 'rounded-4' }
        });
    },

    // 3. Warning Popup
    warning: (title = "Warning", text = "Please check this information.") => {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            confirmButtonColor: '#001f3f',
            customClass: { popup: 'rounded-4' }
        });
    },

    // 4. Delete Confirmation (Professional Dashboard Style)
    confirmDelete: (title = "Are you sure?", text = "This record will be permanently deleted.") => {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Professional Red
            cancelButtonColor: '#001f3f', // Your Navy Blue
            confirmButtonText: 'Yes, Delete it',
            cancelButtonText: 'Cancel',
            customClass: { popup: 'rounded-4' }
        });
    }
};

export default Alerts;