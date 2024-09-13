// for the changing color of the nav bar
let navbar = document.querySelector('.navbarcontrol');
window.addEventListener('scroll', ()=>{
    console.log(window.scrollY);
    if(window.scrollY >= 50){
        navbar.classList.add('navbarcontrolscroll')
    }else{
        navbar.classList.remove('navbarcontrolscroll')
    }
})



// for nav bar and hamburger
let menu = document.querySelector('.hamburgercont');
let menu2 = document.querySelector('.navcollapsone');
let menu22 = document.querySelector('.navbarlist');
menu.onclick = function(){
    menu.classList.toggle("openclose");
    menu2.classList.toggle("navcollapsoneactive");
    menu22.classList.toggle("navbarlistacive");
}
// for nav bar and hamburger ends

// for signupbtn and loginbtn
let signubtn = document.querySelector('.signupbtn');
let loginbtn = document.querySelector('.loginbtn');
let displaylogin = document.querySelector('.displaylogin'); //when alredy having account

let display_signupform = document.querySelector('.signupformcontrol'); //form parent container 
let display_sacitveignupform = document.querySelector('.signupformdivone'); //actual form 

signubtn.addEventListener('click', ()=>{
    display_signupform.classList.toggle('displayform');
    display_sacitveignupform.classList.toggle('signupformactive');
})
displaylogin.addEventListener('click', ()=>{
    // display_signupform.classList.toggle('displayform');
    display_sacitveignupform.classList.toggle('removesignupform');
    // alert('www');
})


// for signupbtn and loginbtn ends


// for main sliding section
let slideIndex = 1;
let isTransitioning = false;
let slideTimeout;

showSlides(slideIndex);

function plusSlides(n) {
    if (isTransitioning) return; // Exit if a transition is in progress

    clearTimeout(slideTimeout); // Clear any existing timeout to prevent overlapping
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    if (isTransitioning) return; // Exit if a transition is in progress

    clearTimeout(slideTimeout); // Clear any existing timeout to prevent overlapping
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let slides = document.querySelectorAll(".main2 img");
    let dots = document.querySelectorAll(".dot");

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    // Set the flag to true to indicate that a transition is in progress
    isTransitioning = true;

    // Adjust the position of the slides container based on the current slide index
    document.querySelector(".main2").style.transform = `translateX(-${(slideIndex - 1) * 100}%)`;

    // Update dots
    dots.forEach((dot, index) => {
        dot.className = dot.className.replace(" active", "");
        if (index === slideIndex - 1) {
            dot.className += " active";
        }
    });

    // After transition ends, reset the flag to allow further interactions
    document.querySelector(".main2").addEventListener('transitionend', () => {
        isTransitioning = false;
    }, { once: true });

    // Reset the slide timeout to allow automatic transitions after the current one completes
    slideTimeout = setTimeout(() => {
        if (!isTransitioning) {
            plusSlides(1);
        }
    }, 5000); // Change image every 5 seconds
}





