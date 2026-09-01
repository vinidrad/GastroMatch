const form = document.getElementById('form');
const senha = document.getElementById('senha');
const email = document.getElementById('email');
const name = document.getElementById('name');

const erroEmail = document.getElementById('erro-email');
const erroSenha = document.getElementById('erro-senha');
const erroName = document.getElementById('erro-name');

form.addEventListener('submit', (e) => {
  let enviarForm = true;

  // limpa os erros anteriores
  email.classList.remove('erro-input');
  senha.classList.remove('erro-input');
  name.classList.remove('erro-input');
  erroEmail.textContent = '';
  erroSenha.textContent = '';
  erroName.textContent = '';

  if (!email.value.trim()) {
    erroEmail.textContent = 'Por favor, preencha o e-mail.';
    email.classList.add('erro-input');
    enviarForm = false;
  }

  if (!name.value.trim()) {
    erroName.textContent = 'Por favor, preencha o nome.';
    name.classList.add('erro-input');
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


fetch('https://localhost:7132/usuario/cadastrar', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Nome: document.getElementById("name").value,
            Email: document.getElementById("email").value,
            Telefone: document.getElementById("telefone").value,
            Senha: document.getElementById("senha").value,

        }),
    })

        .then(response => response.json())
        .then(data => {

            alert("Conta criada com sucesso!");

        })
        .catch(error => {

        });

    
  }
});