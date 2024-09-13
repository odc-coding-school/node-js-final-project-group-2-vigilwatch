// This is our report js file

function setMaxDate() {
 const today = new Date().toISOString().split('T')[0]; 
 document.getElementById('date').setAttribute('max', today);
}

// Call the function to set the max date on page load
setMaxDate();

document.getElementById('images').addEventListener('change', function(event) {
 const files = event.target.files;
 const previewContainer = document.getElementById('imagePreviewContainer');

 // Clear any existing previews
 previewContainer.innerHTML = '';

 Array.from(files).forEach(file => {
     const reader = new FileReader();

     reader.onload = function(e) {
         const img = document.createElement('img');
         img.src = e.target.result;
         img.classList.add('img-thumbnail', 'm-2');
         img.style.maxWidth = '150px';
         img.style.maxHeight = '150px';
         
         // Create a remove button
         const removeBtn = document.createElement('button');
         removeBtn.textContent = 'Remove';
         removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'm-2');
         
         // Remove image on click
         removeBtn.addEventListener('click', () => {
             previewContainer.removeChild(imageContainer);
         });

         // Create a container for image and button
         const imageContainer = document.createElement('div');
         imageContainer.classList.add('d-inline-block');
         imageContainer.appendChild(img);
         imageContainer.appendChild(removeBtn);

         // Add the image container to the preview container
         previewContainer.appendChild(imageContainer);
     };

     reader.readAsDataURL(file);
 });
});
document.getElementById('incidentType').addEventListener('change', function() {
 var otherIncidentDiv = document.getElementById('otherIncidentDiv');
 if (this.value === 'other') {
     otherIncidentDiv.style.display = 'block';
 } else {
     otherIncidentDiv.style.display = 'none';
 }
});

// REAL TIME LOCATION
document.addEventListener("DOMContentLoaded", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AlzaSydsurS3YqxGVdqaV4yrn1AD-8nu9OhpIUB`;

            fetch(geocodeUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        const locationName = data.results[0].formatted_address;
                        document.getElementById('location').value = locationName;
                    } else {
                        document.getElementById('location').value = 'Location not found';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('location').value = 'Error retrieving location';
                });
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

