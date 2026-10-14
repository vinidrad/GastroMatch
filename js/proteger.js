async function verificarLogin() {
    try {
        const resposta = await fetch(
            "https://localhost:7218/Usuario/perfil",
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (resposta.status === 401) {
            window.location.replace("login.html");
            return;
        }

        if (!resposta.ok) {
            console.error("Erro ao verificar login:", resposta.status);
            return;
        }

        console.log("Usuário autenticado!");
    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
    }
}

verificarLogin();