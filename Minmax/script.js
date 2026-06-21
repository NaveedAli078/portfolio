// =====================================================
// GIS PORTFOLIO - SCRIPT.JS
// =====================================================

// ==========================================
// AOS INITIALIZATION
// ==========================================

AOS.init({
    duration:1000,
    once:true
    });
    
    // ==========================================
    // TYPING ANIMATION
    // ==========================================
    
    const typingElement =
    document.querySelector(".typing");
    
    const words = [
    
    "GIS Analyst",
    
    "Remote Sensing Specialist",
    
    "GeoAI Researcher",
    
    "WebGIS Developer",
    
    "Google Earth Engine Expert",
    
    "Spatial Data Scientist"
    
    ];
    
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    
    function typeEffect(){
    
    const currentWord =
    words[wordIndex];
    
    if(!deleting){
    
    typingElement.textContent =
    currentWord.substring(
    0,
    charIndex + 1
    );
    
    charIndex++;
    
    if(charIndex === currentWord.length){
    
    deleting = true;
    
    setTimeout(
    typeEffect,
    1500
    );
    
    return;
    
    }
    
    }
    
    else{
    
    typingElement.textContent =
    currentWord.substring(
    0,
    charIndex - 1
    );
    
    charIndex--;
    
    if(charIndex === 0){
    
    deleting = false;
    
    wordIndex++;
    
    if(wordIndex === words.length){
    
    wordIndex = 0;
    
    }
    
    }
    
    }
    
    setTimeout(
    typeEffect,
    deleting ? 50 : 120
    );
    
    }
    
    typeEffect();
    
    // ==========================================
    // MOBILE MENU
    // ==========================================
    
    const menuBtn =
    document.querySelector(".menu-btn");
    
    const navLinks =
    document.querySelector(".nav-links");
    
    if(menuBtn){
    
    menuBtn.addEventListener(
    "click",
    ()=>{
    
    navLinks.classList.toggle(
    "active"
    );
    
    });
    
    }
    
    // ==========================================
    // CLOSE MENU AFTER CLICK
    // ==========================================
    
    document
    .querySelectorAll(".nav-links a")
    .forEach(link=>{
    
    link.addEventListener(
    "click",
    ()=>{
    
    navLinks.classList.remove(
    "active"
    );
    
    });
    
    });
    
    // ==========================================
    // COUNTER ANIMATION
    // ==========================================
    
    const counters =
    document.querySelectorAll(".counter");
    
    const speed = 200;
    
    counters.forEach(counter=>{
    
    const updateCounter = ()=>{
    
    const target =
    +counter.getAttribute(
    "data-target"
    );
    
    const count =
    +counter.innerText;
    
    const increment =
    target / speed;
    
    if(count < target){
    
    counter.innerText =
    Math.ceil(
    count + increment
    );
    
    setTimeout(
    updateCounter,
    20
    );
    
    }
    else{
    
    counter.innerText =
    target;
    
    }
    
    };
    
    updateCounter();
    
    });
    
    // ==========================================
    // PROJECT FILTER
    // ==========================================
    
    const filterButtons =
    document.querySelectorAll(
    ".filter-btn"
    );
    
    const projectCards =
    document.querySelectorAll(
    ".project-card"
    );
    
    filterButtons.forEach(button=>{
    
    button.addEventListener(
    "click",
    ()=>{
    
    filterButtons.forEach(btn=>
    btn.classList.remove("active")
    );
    
    button.classList.add(
    "active"
    );
    
    const filter =
    button.dataset.filter;
    
    projectCards.forEach(card=>{
    
    if(
    
    filter === "all"
    
    ||
    
    card.classList.contains(filter)
    
    ){
    
    card.style.display="block";
    
    }
    else{
    
    card.style.display="none";
    
    }
    
    });
    
    });
    
    });
    
    // ==========================================
    // NAVBAR SCROLL EFFECT
    // ==========================================
    
    window.addEventListener(
    "scroll",
    ()=>{
    
    const navbar =
    document.querySelector(
    ".navbar"
    );
    
    if(window.scrollY > 100){
    
    navbar.style.padding =
    "15px 10%";
    
    navbar.style.background =
    "rgba(5,8,22,.95)";
    
    }
    else{
    
    navbar.style.padding =
    "20px 10%";
    
    navbar.style.background =
    "rgba(5,8,22,.8)";
    
    }
    
    });
    
    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    
    document
    .querySelectorAll(
    'a[href^="#"]'
    )
    .forEach(anchor=>{
    
    anchor.addEventListener(
    "click",
    function(e){
    
    e.preventDefault();
    
    document.querySelector(
    this.getAttribute("href")
    ).scrollIntoView({
    
    behavior:"smooth"
    
    });
    
    });
    
    });
    
    // ==========================================
    // LIGHTBOX GALLERY
    // ==========================================
    
    const galleryImages =
    document.querySelectorAll(
    ".gallery-grid img"
    );
    
    const lightbox =
    document.createElement("div");
    
    lightbox.classList.add(
    "lightbox"
    );
    
    document.body.appendChild(
    lightbox
    );
    
    galleryImages.forEach(image=>{
    
    image.addEventListener(
    "click",
    ()=>{
    
    lightbox.classList.add(
    "active"
    );
    
    const img =
    document.createElement(
    "img"
    );
    
    img.src = image.src;
    
    while(
    lightbox.firstChild
    ){
    
    lightbox.removeChild(
    lightbox.firstChild
    );
    
    }
    
    lightbox.appendChild(img);
    
    });
    
    });
    
    lightbox.addEventListener(
    "click",
    ()=>{
    
    lightbox.classList.remove(
    "active"
    );
    
    });
    
    // ==========================================
    // THEME TOGGLE
    // ==========================================
    
    const themeButton =
    document.createElement("div");
    
    themeButton.classList.add(
    "theme-toggle"
    );
    
    themeButton.innerHTML =
    '<i class="fas fa-moon"></i>';
    
    document.body.appendChild(
    themeButton
    );
    
    themeButton.addEventListener(
    "click",
    ()=>{
    
    document.body.classList.toggle(
    "light-mode"
    );
    
    if(
    document.body.classList.contains(
    "light-mode"
    )
    ){
    
    themeButton.innerHTML =
    '<i class="fas fa-sun"></i>';
    
    }
    else{
    
    themeButton.innerHTML =
    '<i class="fas fa-moon"></i>';
    
    }
    
    });
    
    // ==========================================
    // CONTACT FORM
    // ==========================================
    
    const contactForm =
    document.getElementById(
    "contactForm"
    );
    
    if(contactForm){
    
    contactForm.addEventListener(
    "submit",
    function(e){
    
    e.preventDefault();
    
    alert(
    "Thank you! Your message has been submitted."
    );
    
    contactForm.reset();
    
    });
    
    }
    
    // ==========================================
    // SCROLL PROGRESS BAR
    // ==========================================
    
    const progressBar =
    document.createElement("div");
    
    progressBar.style.position =
    "fixed";
    
    progressBar.style.top =
    "0";
    
    progressBar.style.left =
    "0";
    
    progressBar.style.height =
    "4px";
    
    progressBar.style.background =
    "#00e5ff";
    
    progressBar.style.zIndex =
    "99999";
    
    document.body.appendChild(
    progressBar
    );
    
    window.addEventListener(
    "scroll",
    ()=>{
    
    const totalHeight =
    
    document.documentElement
    .scrollHeight
    
    -
    
    window.innerHeight;
    
    const progress =
    
    (window.pageYOffset /
    totalHeight) * 100;
    
    progressBar.style.width =
    progress + "%";
    
    });
    
    // ==========================================
    // LOADER SCREEN
    // ==========================================
    
    window.addEventListener(
    "load",
    ()=>{
    
    const loader =
    document.createElement("div");
    
    loader.id = "loader";
    
    loader.innerHTML =
    
    '<div class="loader-circle"></div>';
    
    document.body.appendChild(
    loader
    );
    
    setTimeout(()=>{
    
    loader.style.opacity = "0";
    
    setTimeout(()=>{
    
    loader.remove();
    
    },500);
    
    },800);
    
    });
    
    // ==========================================
    // PARALLAX EFFECT
    // ==========================================
    
    window.addEventListener(
    "scroll",
    ()=>{
    
    const scrolled =
    window.pageYOffset;
    
    const hero =
    document.querySelector(
    "#home"
    );
    
    if(hero){
    
    hero.style.backgroundPositionY =
    
    scrolled * 0.5 + "px";
    
    }
    
    });
    
    // ==========================================
    // ACTIVE NAV LINK
    // ==========================================
    
    const sections =
    document.querySelectorAll(
    "section"
    );
    
    const navItems =
    document.querySelectorAll(
    ".nav-links a"
    );
    
    window.addEventListener(
    "scroll",
    ()=>{
    
    let current = "";
    
    sections.forEach(section=>{
    
    const sectionTop =
    section.offsetTop;
    
    if(
    pageYOffset >=
    sectionTop - 200
    ){
    
    current =
    section.getAttribute("id");
    
    }
    
    });
    
    navItems.forEach(link=>{
    
    link.classList.remove(
    "active"
    );
    
    if(
    link.getAttribute("href")
    === "#" + current
    ){
    
    link.classList.add(
    "active"
    );
    
    }
    
    });
    
    });
    
    // ==========================================
    // FLOATING CARDS EFFECT
    // ==========================================
    
    const cards =
    document.querySelectorAll(
    
    ".service-card, .project-card, .research-card"
    
    );
    
    cards.forEach(card=>{
    
    card.addEventListener(
    "mousemove",
    (e)=>{
    
    const rect =
    card.getBoundingClientRect();
    
    const x =
    e.clientX - rect.left;
    
    const y =
    e.clientY - rect.top;
    
    card.style.transform =
    
    `rotateX(${(y-100)/20}deg)
     rotateY(${-(x-100)/20}deg)
     translateY(-8px)`;
    
    });
    
    card.addEventListener(
    "mouseleave",
    ()=>{
    
    card.style.transform =
    "rotateX(0) rotateY(0)";
    
    });
    
    });
    
    // ==========================================
    // YEAR AUTO UPDATE
    // ==========================================
    
    const footerYear =
    document.getElementById(
    "year"
    );
    
    if(footerYear){
    
    footerYear.textContent =
    new Date().getFullYear();
    
    }
    
    // ==========================================
    // CONSOLE MESSAGE
    // ==========================================
    
    console.log(
    
    "%c GIS Portfolio Loaded Successfully",
    
    "color:#00e5ff;font-size:16px;font-weight:bold"
    
    );
    
    // =====================================================
    // END OF SCRIPT.JS
    // =====================================================