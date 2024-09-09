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

  
