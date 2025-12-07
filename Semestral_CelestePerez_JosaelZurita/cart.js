// carrito simple en localStorage
const CART_KEY='turismo_cart_v1';
function getCart(){return JSON.parse(localStorage.getItem(CART_KEY)||'[]');}
function saveCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c)); updateCartCount();}
function addToCart(item){const c=getCart(); c.push(item); saveCart(c);}
function removeFromCart(i){const c=getCart(); c.splice(i,1); saveCart(c);}
function clearCart(){localStorage.removeItem(CART_KEY); updateCartCount();}
function calcTotal(){return getCart().reduce((s,i)=>s + (i.price||0),0);}
function updateCartCount(){document.getElementById('cartCount').textContent=getCart().length}


// Bind cart button (muestra modal simple)
document.getElementById('cartBtn')?.addEventListener('click',()=>{
const cart=getCart();
const list = cart.map((it, i)=>`${i+1}. ${it.title} - $${it.price}` ).join('\n') || 'Carrito vacío';
const total=calcTotal();
if(confirm(list + '\n\nTotal: $' + total + '\n\nFinalizar compra?')){
alert('Compra realizada (simulación). Gracias.'); clearCart(); }
});
updateCartCount();