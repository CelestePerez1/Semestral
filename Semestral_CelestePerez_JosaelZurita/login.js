function login() {
  let u = user.value;
  let p = pass.value;

  if (u === "admin" && p === "123") {
    window.location = "admin.html";
  } else {
    alert("Usuario incorrecto");
  }
}