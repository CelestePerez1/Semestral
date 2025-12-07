const USERS_KEY='turismo_users_v1';
// Usuarios por defecto
if(!localStorage.getItem(USERS_KEY)){
const defaults=[{user:'admin',pass:'admin123',role:'admin'}];
localStorage.setItem(USERS_KEY,JSON.stringify(defaults));
}
function login(user,pass){
const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');
return users.find(u=>u.user===user && u.pass===pass);
}