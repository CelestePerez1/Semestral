// ===========================
// Slider automático
// ===========================
let currentSlide = 0;
const slider = document.getElementById("slider");
const totalSlides = document.querySelectorAll(".slide").length;

function showSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

document.getElementById("nextSlide").addEventListener("click", () => {
    showSlide(currentSlide + 1);
});

document.getElementById("prevSlide").addEventListener("click", () => {
    showSlide(currentSlide - 1);
});

// Auto-slide cada 4 segundos
setInterval(() => {
    showSlide(currentSlide + 1);
}, 4000);

// ===========================
// Menú Hamburguesa
// ===========================
document.getElementById('hamburger').addEventListener('click', () => {
    const nav = document.querySelector('.nav-list');
    nav.classList.toggle('nav-open'); // Mucho mejor que cambiar display
});


// ===========================
// Modal de Bienvenida
// ===========================
const welcomeModal = document.getElementById('welcomeModal');
const closeWelcome = document.getElementById('closeWelcome');
const startBtn = welcomeModal.querySelector('.btn'); // BOTÓN "COMENZAR"

// Mostrar modal solo la primera vez
window.addEventListener('load', () => {
    if (!localStorage.getItem('seenWelcome')) {
        welcomeModal.classList.remove('hidden');
    }
});

// Cerrar modal con la X
closeWelcome.addEventListener('click', () => {
    welcomeModal.classList.add('hidden');
    localStorage.setItem('seenWelcome', '1');
});

// Cerrar modal con botón "Comenzar"
startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    welcomeModal.classList.add('hidden');
    localStorage.setItem('seenWelcome', '1');
});


// ===========================
// Footer - Año automático
// ===========================
document.getElementById('year').textContent = new Date().getFullYear();


// ===========================
// Chatbot
// ===========================
const chat = document.getElementById('chatbot');
const openChat = document.getElementById('openChatBtn');
const closeChatBtn = document.getElementById('closeChat');

openChat.addEventListener('click', () => {
    chat.classList.toggle('hidden');
});

closeChatBtn.addEventListener('click', () => {
    chat.classList.add('hidden');
});
