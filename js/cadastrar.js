const form = document.getElementById('form');
const senha = document.getElementById('senha');
const email = document.getElementById('email');
const nome = document.getElementById('nome');

const erroEmail = document.getElementById('erro-email');
const erroSenha = document.getElementById('erro-senha');
const erroName = document.getElementById('erro-name');

form.addEventListener('submit', (e) => {

    e.preventDefault();

    let enviarForm = true;

    // Limpa os erros anteriores
    email.classList.remove('erro-input');
    senha.classList.remove('erro-input');
    nome.classList.remove('erro-input');

    erroEmail.textContent = '';
    erroSenha.textContent = '';
    erroName.textContent = '';

    // Validação do e-mail
    if (!email.value.trim()) {
        erroEmail.textContent = 'Por favor, preencha o e-mail.';
        email.classList.add('erro-input');
        enviarForm = false;
    }

    // Validação do nome
    if (!nome.value.trim()) {
        erroName.textContent = 'Por favor, preencha o nome.';
        nome.classList.add('erro-input');
        enviarForm = false;
    }

    // Validação da senha
    if (!senha.value.trim()) {

        erroSenha.textContent = 'Por favor, preencha a senha.';
        senha.classList.add('erro-input');
        enviarForm = false;

    } else if (senha.value.trim().length < 6) {

        erroSenha.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        senha.classList.add('erro-input');
        enviarForm = false;
    }

    // Tipo de usuário
    const tipoUsuario = document.getElementById("tipo_usuario").value;

    if (!tipoUsuario) {
        alert("Selecione o tipo de usuário.");
        enviarForm = false;
    }

    
    if (!enviarForm) {
        return;
    }


    let chef = false;
    let restaurante = false;
    let cliente = false;

    if (tipoUsuario === "cliente") {
        cliente = true;
    }
    else if (tipoUsuario === "chef") {
        chef = true;
    }
    else if (tipoUsuario === "restaurante") {
        restaurante = true;
    }

    
    fetch('https://localhost:7218/usuario/cadastrar', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Nome: nome.value,
            Email: email.value,
            Telefone: document.getElementById("telefone").value,
            Senha: senha.value,

            Chef: chef,
            Restaurante: restaurante,
            Cliente: cliente
        })
    })
    .then(async response => {

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensagem || "Erro ao cadastrar usuário.");
        }

        return data;
    })
    .then(data => {

        alert("Conta criada com sucesso!");

        window.location.href = "login.html";

    })
    .catch(error => {

        console.error(error);
        alert(error.message);

    });

});