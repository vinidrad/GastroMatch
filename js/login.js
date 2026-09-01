const form = document.getElementById('form');
const senha = document.getElementById('senha');
const email = document.getElementById('email');

const erroEmail = document.getElementById('erro-email');
const erroSenha = document.getElementById('erro-senha');

form.addEventListener('submit', (e) => {
  let enviarForm = true;

  // limpa os erros anteriores
  email.classList.remove('erro-input');
  senha.classList.remove('erro-input');
  erroEmail.textContent = '';
  erroSenha.textContent = '';

  if (!email.value.trim()) {
    erroEmail.textContent = 'Por favor, preencha o e-mail.';
    email.classList.add('erro-input');
    enviarForm = false;
  }

  if (!senha.value.trim()) {
  erroSenha.textContent = 'Por favor, preencha a senha.';
  senha.classList.add('erro-input');
  enviarForm = false;

} else if (senha.value.trim().length < 6) {
  erroSenha.textContent = 'A senha deve ter pelo menos 6 caracteres.';
  senha.classList.add('erro-input');
  enviarForm = false;
}

  if (!enviarForm) {
    e.preventDefault();

    const valido =0

        validarEmail() &&
        validarSenha() 
       

    if (valido) {
           fetch("https://localhost:7132/usuario/login", {
        method: "POST",
        credentials:"include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email:document.getElementById("email"),
            senha:document.getElementById("senha")
        })
    })
    
    .then(data => {
        console.log("Sucesso:", data);
        window.location.href='index.html'
       
       
    })
    .catch(error => {
        console.error("Erro:", error);
        alert
    });

    }
 }
});
