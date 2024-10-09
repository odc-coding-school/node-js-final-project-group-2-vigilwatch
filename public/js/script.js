// This is  our script js file

// Function to toggle theme and save preference
// function toggleTheme() {
//   const body = document.body;
//   const themeIcon = document.getElementById('theme-icon');
//   const sidebar = document.getElementById('sidebarMenu');
//   const navbar = document.getElementById('main-navbar');

//   // Toggle between dark and light modes
//   if (body.classList.contains('dark-mode')) {
//       body.classList.remove('dark-mode');
//       body.classList.add('light-mode');
//       themeIcon.classList.replace('fa-moon', 'fa-sun'); // Change to sun icon
//       sidebar.classList.replace('bg-dark', 'bg-white');
//       navbar.classList.replace('navbar-dark', 'navbar-light');
//       localStorage.setItem('theme', 'light-mode'); // Save theme preference
//   } else {
//       body.classList.remove('light-mode');
//       body.classList.add('dark-mode');
//       themeIcon.classList.replace('fa-sun', 'fa-moon'); // Change to moon icon
//       sidebar.classList.replace('bg-white', 'bg-dark');
//       navbar.classList.replace('navbar-light', 'navbar-dark');
//       localStorage.setItem('theme', 'dark-mode'); // Save theme preference
//   }
// }

// Function to apply the saved theme on page load
// function applySavedTheme() {
//   const savedTheme = localStorage.getItem('theme');
//   const body = document.body;
//   const themeIcon = document.getElementById('theme-icon');
//   const sidebar = document.getElementById('sidebarMenu');
//   const navbar = document.getElementById('main-navbar');

//   if (savedTheme) {
//       body.classList.add(savedTheme);

//       if (savedTheme === 'dark-mode') {
//           themeIcon.classList.replace('fa-sun', 'fa-moon');
//           sidebar.classList.replace('bg-white', 'bg-dark');
//           navbar.classList.replace('navbar-light', 'navbar-dark');
//       } else {
//           themeIcon.classList.replace('fa-moon', 'fa-sun');
//           sidebar.classList.replace('bg-dark', 'bg-white');
//           navbar.classList.replace('navbar-dark', 'navbar-light');
//       }
//   }
// }

// Apply the saved theme when the page loads
// document.addEventListener('DOMContentLoaded', applySavedTheme);

document.addEventListener("DOMContentLoaded", function() {
  const iframes = document.querySelectorAll('iframe');

  iframes.forEach(iframe => {
      iframe.onload = function() {
          const mapContainer = iframe.closest('.map-container');
          const preloader = mapContainer.querySelector('.map-preloader');

          // Hide preloader and show iframe
          preloader.style.display = 'none';
          iframe.style.display = 'block';
      };
  });
});

document.addEventListener("DOMContentLoaded", function() {
const searchInput = document.getElementById('search');
const cards = document.querySelectorAll('.card');

searchInput.addEventListener('input', function() {
  const searchTerm = searchInput.value.toLowerCase();

  cards.forEach(card => {
      const location = card.querySelector('.card-title').textContent.toLowerCase();

      if (location.includes(searchTerm)) {
          card.style.display = '';
      } else {
          card.style.display = 'none';
      }
  });
});

cards.forEach(card => card.style.display = '');
});


// ANALYSIS
const socket = io();

// Listen for new notifications
socket.on('new_notification', (data) => {
    console.log('Received new notification:', data);

    // Play notification sound
    const audio = new Audio('/sounds/notification-sound.mp3');
    audio.play().catch(err => {
        console.log('Audio playback error:', err);
    });

    // Display notification message (this works even if you're on a different page)
    if (Notification.permission === "granted") {
        new Notification(`New Incident: ${data.incident_type}`, {
            body: `${data.description}`,
            icon: '/images/Logo.png'
        });
    } else {
        // Request permission to show notifications
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(`New Incident: ${data.incident_type}`, {
                    body: `${data.description}`,
                    icon: '/images/Logo.png'
                });
            }
        });
    }

    // Optionally, show an alert as well (not as elegant, but useful)
    alert(`You have a new notification: ${data.incident_type} - ${data.description}`);
});



     function changeMonth() {
         const selectedMonth = document.getElementById('month').value;
         window.location.href = `/?month=${selectedMonth}`;
     }
 
     
  
     function toggleReadMore(incidentId, fullDescription) {
        const descriptionElement = document.getElementById(`desc-${incidentId}`);
        const isExpanded = descriptionElement.innerText.endsWith('...');
    
        if (isExpanded) {
            descriptionElement.innerText = fullDescription; // Show full description
            descriptionElement.classList.add('expanded'); // Add expanded class for transition
            descriptionElement.nextElementSibling.innerText = 'Read less'; // Change link text to 'Read less'
        } else {
            descriptionElement.innerText = fullDescription.substring(0, 50) + '...'; // Show truncated version
            descriptionElement.classList.remove('expanded'); // Remove expanded class for transition
            descriptionElement.nextElementSibling.innerText = 'Read more'; // Change link text back to 'Read more'
        }
    }

