// This is  our script js file

function toggleTheme() {
 const body = document.body;
 const themeIcon = document.getElementById('theme-icon');
 const sidebar = document.getElementById('sidebarMenu');
 const navbar = document.getElementById('main-navbar');

 // Toggle between dark and light modes
 if (body.classList.contains('dark-mode')) {
   body.classList.remove('dark-mode');
   body.classList.add('light-mode');
   themeIcon.classList.replace('fa-moon', 'fa-sun'); // Change to sun icon
   sidebar.classList.replace('bg-dark', 'bg-white');
   navbar.classList.replace('navbar-dark', 'navbar-light');
 } else {
   body.classList.remove('light-mode');
   body.classList.add('dark-mode');
   themeIcon.classList.replace('fa-sun', 'fa-moon'); // Change to moon icon
   sidebar.classList.replace('bg-white', 'bg-dark');
   navbar.classList.replace('navbar-light', 'navbar-dark');
 }
}

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
  
