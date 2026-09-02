
const form = document.getElementById('form');
const senha = document.getElementById('senha');
const email = document.getElementById('email');

const erroEmail = document.getElementById('erro-email');
const erroSenha = document.getElementById('erro-senha');

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    let enviarForm = true;

    // =========================
    // LIMPA OS ERROS
    // =========================

    email.classList.remove('erro-input');
    senha.classList.remove('erro-input');

    erroEmail.textContent = '';
    erroSenha.textContent = '';


    // =========================
    // VALIDA E-MAIL
    // =========================

    if (!email.value.trim()) {

        erroEmail.textContent = 'Por favor, preencha o e-mail.';
        email.classList.add('erro-input');

        enviarForm = false;
    }


    // =========================
    // VALIDA SENHA
    // =========================

    if (!senha.value.trim()) {

        erroSenha.textContent = 'Por favor, preencha a senha.';
        senha.classList.add('erro-input');

        enviarForm = false;

    } else if (senha.value.trim().length < 6) {

        erroSenha.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        senha.classList.add('erro-input');

        enviarForm = false;
    }


    // =========================
    // SE TIVER ERRO, PARA AQUI
    // =========================

    if (!enviarForm) {
        return;
    }


    // =========================
    // LOGIN
    // =========================

    try {

        const response = await fetch("https://localhost:7218/usuario/login", {

            method: "POST",

            credentials: "include",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email.value,
                senha: senha.value

            })
        });


        console.log("Status da API:", response.status);


        const texto = await response.text();

        console.log("Resposta da API:", texto);


        // =========================
        // LOGIN INCORRETO / ERRO
        // =========================

        if (!response.ok) {

            erroSenha.textContent = "E-mail ou senha incorretos.";
            senha.classList.add('erro-input');

            return;
        }


        // =========================
        // LOGIN REALIZADO
        // =========================

        console.log("");

        window.location.href = "index.html";


    } catch (error) {

        console.error("ERRO NO LOGIN:", error);

        erroSenha.textContent = "Não foi possível conectar ao servidor.";
    }

});

