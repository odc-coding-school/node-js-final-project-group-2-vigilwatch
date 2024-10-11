// This is our registration js file

function togglePasswordVisibility() {
 const passwordInput = document.getElementById('password');
 const toggleIcon = document.getElementById('toggleIcon');

 if (passwordInput.type === 'password') {
     passwordInput.type = 'text';
     toggleIcon.classList.remove('bi-eye');
     toggleIcon.classList.add('bi-eye-slash');
 } else {
     passwordInput.type = 'password';
     toggleIcon.classList.remove('bi-eye-slash');
     toggleIcon.classList.add('bi-eye');
 }
}
function toggleConfirmPasswordVisibility() {
 const passwordInput = document.getElementById('confirm_password');
 const toggleIcon = document.getElementById('ConfirmPasswordtoggleIcon');

 if (passwordInput.type === 'password') {
     passwordInput.type = 'text';
     toggleIcon.classList.remove('bi-eye');
     toggleIcon.classList.add('bi-eye-slash');
 } else {
     passwordInput.type = 'password';
     toggleIcon.classList.remove('bi-eye-slash');
     toggleIcon.classList.add('bi-eye');
 }
}

function previewImage(event) {
 const input = event.target;
 const preview = document.getElementById('profile_picture_preview');
 
 if (input.files && input.files[0]) {
     const reader = new FileReader();
     
     reader.onload = function(e) {
         preview.src = e.target.result;
         preview.style.display = 'block';
     }
     
     reader.readAsDataURL(input.files[0]); // convert to base64 string
 }
}

