// Slider automático
(function(){
const slider=document.getElementById('slider');
const slides=slider.querySelectorAll('img');
let idx=0;
function next(){ idx=(idx+1)%slides.length; slider.style.transform=`translateX(-${idx*100}%)`; }
setInterval(next,3000);
})();


// Hamburger toggling
document.getElementById('hamburger').addEventListener('click',()=>{
const nav=document.querySelector('.nav-list'); nav.style.display = nav.style.display==='flex'?'none':'flex';
});


// Modal bienvenida
const welcome=document.getElementById('welcomeModal');
const closeWelcome=document.getElementById('closeWelcome');
window.addEventListener('load',()=>{ if(!localStorage.getItem('seenWelcome')){ welcome.classList.remove('hidden'); } });
closeWelcome.addEventListener('click',()=>{ welcome.classList.add('hidden'); localStorage.setItem('seenWelcome','1'); });


// Footer year
document.getElementById('year').textContent=new Date().getFullYear();


// Chat toggle
const chat=document.getElementById('chatbot');
const openChat=document.getElementById('openChatBtn');
const closeChat=document.getElementById('closeChat');
openChat.addEventListener('click',()=>chat.classList.toggle('hidden'));
closeChat && closeChat.addEventListener('click',()=>chat.classList.add('hidden'));