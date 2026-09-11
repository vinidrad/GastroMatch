const API_URL = "https://localhost:7218";

document.addEventListener("DOMContentLoaded", function () {


    

    fetch(`${API_URL}/Usuario/perfil`, {
        method: "GET",
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao carregar perfil.");
        }

        return response.json();
    })
   .then(usuario => {

    console.log("USUÁRIO RECEBIDO:", usuario);

    console.log("TIPO:", usuario.restaurante);

var tipoUsuario = document.getElementById("tipoUsuario");

console.log("CAMPO TIPO:", tipoUsuario);

    // =========================
    // LADO ESQUERDO
    // =========================

    document.getElementById("nomeUsuario").textContent =
        usuario.nome || "Usuário";

    document.getElementById("descricaoUsuario").textContent =
        usuario.bio || "Bem-vindo ao GastroMatch! Fale mais sobre você.";


    // =========================
    // INFORMAÇÕES
    // =========================

    document.getElementById("nome").value =
        usuario.nome || "";

    document.getElementById("email").value =
        usuario.email || "";

    document.getElementById("telefone").value =
        usuario.telefone || "";

    document.getElementById("descricao").value =
    usuario.bio || "Bem-vindo ao GastroMatch! Fale mais sobre você.";


    // =========================
    // TIPO DE USUÁRIO
    // =========================

   var tipoUsuario = document.getElementById("tipoUsuario");

if (usuario.chef) {
    tipoUsuario.value = "Chef";
}
else if (usuario.restaurante) {
    tipoUsuario.value = "Restaurante";
}
else if (usuario.cliente) {
    tipoUsuario.value = "Cliente";
}



    // =========================
    // FOTO
    // =========================

    if (usuario.foto_perfil) {

        document.getElementById("fotoGrande").style.backgroundImage =
            `url(${API_URL}${usuario.foto_perfil})`;

    }


    // =========================
    // DOCUMENTO
    // =========================

    if (usuario.chef === true) {

        document.getElementById("tipoDocumento").textContent =
            "Certificado";

        if (usuario.certificado) {

            document.getElementById("statusDocumento").textContent =
                "Documento enviado";

        }
        else {

            document.getElementById("statusDocumento").textContent =
                "Envie seu certificado";

        }

    }
    else if (usuario.restaurante === true) {

        document.getElementById("tipoDocumento").textContent =
            "CNPJ";

        if (usuario.cnpj) {

            document.getElementById("statusDocumento").textContent =
                "Documento enviado";

        }
        else {

            document.getElementById("statusDocumento").textContent =
                "Envie seu CNPJ";

        }

    }
    else {

        document.getElementById("tipoDocumento").textContent =
            "Documento";

        document.getElementById("statusDocumento").textContent =
            "Não é necessário";

    }

    });

});