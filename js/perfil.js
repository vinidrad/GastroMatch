const API_URL = "https://localhost:7218";

let usuarioAtual = null;


/* =====================================================
   INICIAR
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    carregarPerfil();

    configurarMenu();

    configurarUpload();

});


/* =====================================================
   CARREGAR PERFIL
===================================================== */

function carregarPerfil() {

    fetch(`${API_URL}/Usuario/perfil`, {

        method: "GET",
        credentials: "include"

    })

    .then(function (resposta) {

        if (!resposta.ok) {

            if (resposta.status === 401) {

                alert("Você precisa estar logado.");

                window.location.href = "login.html";

                return;
            }

            throw new Error("Erro ao carregar perfil.");
        }

        return resposta.json();

    })

    .then(function (usuario) {

        if (!usuario) {
            return;
        }

        usuarioAtual = usuario;

        preencherPerfil(usuario);

        /*
            Quando o perfil carregar,
            já mostra Cursos
        */
        mostrarCursos();

    })

    .catch(function (erro) {

        console.error("Erro ao carregar perfil:", erro);

        alert("Não foi possível carregar seu perfil.");

    });

}


/* =====================================================
   PREENCHER PERFIL
===================================================== */

function preencherPerfil(usuario) {


    /* =========================
       NOME DO SIDEBAR
    ========================= */

    const nomeUsuario =
        document.getElementById("nomeUsuario");

    if (nomeUsuario) {

        nomeUsuario.textContent =
            usuario.nome || "";

    }


    /* =========================
       NOME
    ========================= */

    const nome =
        document.getElementById("nome");

    if (nome) {

        nome.value =
            usuario.nome || "";

    }


    /* =========================
       EMAIL
    ========================= */

    const email =
        document.getElementById("email");

    if (email) {

        email.value =
            usuario.email || "";

    }


    /* =========================
       TELEFONE
    ========================= */

    const telefone =
        document.getElementById("telefone");

    if (telefone) {

        telefone.value =
            usuario.telefone || "";

    }

    


if (usuario.foto_perfil) {

    document.getElementById("fotoGrande").style.backgroundImage =
        `url('${API_URL}${usuario.foto_perfil}')`;

}


    /* =========================
       TIPO DE USUÁRIO
    ========================= */

    const tipo =
        document.getElementById("tipoUsuario");

    if (tipo) {

        if (usuario.chef) {

            tipo.value = "Chef";

        }

        else if (usuario.restaurante) {

            tipo.value = "Restaurante";

        }

        else {

            tipo.value = "Cliente";

        }

    }


    /* =========================
       DOCUMENTO
    ========================= */

    configurarDocumento(usuario);

}


/* =====================================================
   CONFIGURAR DOCUMENTO
===================================================== */

function configurarDocumento(usuario) {

    const area =
        document.getElementById("documentoArea");

    const label =
        document.getElementById("labelDocumento");

    const status =
        document.getElementById("statusDocumento");

    const input =
        document.getElementById("arquivo");


    /*
        Se não estiver na página
        de informações, não faz nada.
    */

    if (!area || !label || !status || !input) {

        return;

    }


    /* =========================
       CLIENTE
    ========================= */

    if (usuario.cliente) {

        area.style.display = "none";

        return;

    }


    /* =========================
       CHEF
    ========================= */

    if (usuario.chef) {

        label.textContent =
            "Envie o certificado";


        if (usuario.statusCertificado === "Aprovado") {

            mostrarDocumentoAprovado(
                "Certificado enviado ✓"
            );

        }

        else {

            status.textContent =
                "Não enviado";

        }

    }


    /* =========================
       RESTAURANTE
    ========================= */

    if (usuario.restaurante) {

        label.textContent =
            "Envie a documentação do CNPJ";


        if (usuario.statusCnpj === "Aprovado") {

            mostrarDocumentoAprovado(
                "Documento enviado ✓"
            );

        }

        else {

            status.textContent =
                "Não enviado";

        }

    }

}


/* =====================================================
   DOCUMENTO APROVADO
===================================================== */

function mostrarDocumentoAprovado(texto) {

    const area =
        document.getElementById("documentoArea");

    const label =
        document.getElementById("labelDocumento");

    const status =
        document.getElementById("statusDocumento");


    if (!area || !label || !status) {
        return;
    }


    area.classList.add("documento-aprovado");

    label.textContent = texto;

    status.textContent = "Validado";

    label.removeAttribute("for");

}


/* =====================================================
   UPLOAD DO DOCUMENTO
===================================================== */

function configurarUpload() {

    document.addEventListener("change", function (evento) {

        if (evento.target.id !== "arquivo") {

            return;

        }


        const arquivo =
            evento.target.files[0];


        if (!arquivo) {

            return;

        }


        /* =========================
           VERIFICAR PDF
        ========================= */

        if (arquivo.type !== "application/pdf") {

            alert(
                "Selecione somente arquivos PDF."
            );

            evento.target.value = "";

            return;

        }


        /* =========================
           LIMITE 10 MB
        ========================= */

        const tamanhoMaximo =
            10 * 1024 * 1024;


        if (arquivo.size > tamanhoMaximo) {

            alert(
                "O arquivo não pode ter mais de 10 MB."
            );

            evento.target.value = "";

            return;

        }


        enviarArquivo(arquivo);

    });

}


/* =====================================================
   ENVIAR DOCUMENTO
===================================================== */

function enviarArquivo(arquivo) {

    const formData =
        new FormData();

    formData.append(
        "arquivo",
        arquivo
    );


    fetch(`${API_URL}/Usuario/enviar-arquivo`, {

        method: "POST",

        credentials: "include",

        body: formData

    })

    .then(function (resposta) {

        return resposta.json()
            .then(function (dados) {

                return {

                    ok: resposta.ok,

                    dados: dados

                };

            });

    })

    .then(function (resultado) {

        if (!resultado.ok) {

            alert(
                resultado.dados.mensagem ||
                "Erro ao enviar arquivo."
            );

            return;

        }


        alert(
            resultado.dados.mensagem ||
            "Documento enviado com sucesso."
        );


        if (usuarioAtual) {

            mostrarDocumentoAprovado(

                usuarioAtual.chef

                    ? "Certificado enviado ✓"

                    : "Documento enviado ✓"

            );

        }

    })

    .catch(function (erro) {

        console.error(
            "Erro ao enviar arquivo:",
            erro
        );

        alert(
            "Não foi possível enviar o arquivo."
        );

    });

}


/* =====================================================
   BOTÃO EDITAR
===================================================== */

function abrirInformacoes() {

    window.location.href =
        "editarperfil.html";

}


function abrirperfil() {

    window.location.href =
        "perfil.html";

}

/* =====================================================
   MENU
===================================================== */

function configurarMenu() {

    const btnReceitas =
        document.getElementById("btnReceitas");

    const btnFavoritos =
        document.getElementById("btnFavoritos");

    const btnCursos =
        document.getElementById("btnCursos");

    const btnSair =
        document.getElementById("btnSair");


    /* =========================
       CURSOS
    ========================= */

    if (btnCursos) {

        btnCursos.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                mostrarCursos();

            }
        );

    }


    /* =========================
       RECEITAS
    ========================= */

    if (btnReceitas) {

        btnReceitas.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                mostrarReceitas();

            }
        );

    }


    /* =========================
       FAVORITOS
    ========================= */

    if (btnFavoritos) {

        btnFavoritos.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                mostrarFavoritos();

            }
        );

    }


    /* =========================
       SAIR
    ========================= */

    if (btnSair) {

        btnSair.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                sair();

            }
        );

    }

}


/* =====================================================
   MOSTRAR CURSOS
===================================================== */

function mostrarCursos() {

    const tituloConteudo =
        document.getElementById("tituloConteudo");

    const btnNovo =
        document.getElementById("btnNovo");


    if (!tituloConteudo) {
        return;
    }


    tituloConteudo.textContent =
        "Cursos";


    /*
        CLIENTE
    */

    if (usuarioAtual && usuarioAtual.cliente) {

        mostrarVazio(

            "Você não comprou nenhum curso ainda.",

            "Quando você comprar um curso, ele aparecerá aqui."

        );


        if (btnNovo) {

            btnNovo.style.display =
                "none";

        }

        return;

    }


    /*
        CHEF / RESTAURANTE
    */

    mostrarVazio(

        "Você não criou nenhum curso ainda.",

        'Clique em "Novo curso" para cadastrar seu primeiro curso.'

    );


    if (btnNovo) {

        btnNovo.style.display =
            "block";

        btnNovo.textContent =
            "Novo curso";

        btnNovo.onclick =
            novoCurso;

    }

}


/* =====================================================
   MOSTRAR RECEITAS
===================================================== */

function mostrarReceitas() {

    const tituloConteudo =
        document.getElementById("tituloConteudo");

    const btnNovo =
        document.getElementById("btnNovo");


    if (!tituloConteudo) {
        return;
    }


    tituloConteudo.textContent =
        "Receitas";


    /*
        CLIENTE
    */

    if (usuarioAtual && usuarioAtual.cliente) {

        mostrarVazio(

            "Você não comprou nenhuma receita ainda.",

            "Quando você comprar uma receita, ela aparecerá aqui."

        );


        if (btnNovo) {

            btnNovo.style.display =
                "none";

        }

        return;

    }


    /*
        CHEF / RESTAURANTE
    */

    mostrarVazio(

        "Você não criou nenhuma receita ainda.",

        "Quando você cadastrar uma receita, ela aparecerá aqui."

    );


    if (btnNovo) {

        btnNovo.style.display =
            "block";

        btnNovo.textContent =
            "Nova receita";

        btnNovo.onclick =
            novaReceita;

    }

}


/* =====================================================
   MOSTRAR FAVORITOS
===================================================== */

function mostrarFavoritos() {

    const tituloConteudo =
        document.getElementById("tituloConteudo");

    const btnNovo =
        document.getElementById("btnNovo");


    if (!tituloConteudo) {
        return;
    }


    tituloConteudo.textContent =
        "Favoritos";


    if (btnNovo) {

        btnNovo.style.display =
            "none";

    }


    mostrarVazio(

        "Você não favoritou nada ainda.",

        "Os cursos e receitas que você favoritar aparecerão aqui."

    );

}


/* =====================================================
   MENSAGEM VAZIA
===================================================== */

function mostrarVazio(titulo, texto) {

    const areaConteudo =
        document.getElementById("areaConteudo");


    if (!areaConteudo) {

        return;

    }


    areaConteudo.innerHTML = `

        <div class="mensagem-vazia">

            <h3>
                ${titulo}
            </h3>

            <p>
                ${texto}
            </p>

        </div>

    `;

}


/* =====================================================
   NOVO CURSO
===================================================== */

function novoCurso() {

    window.location.href =
        "criar.html";

}


/* =====================================================
   NOVA RECEITA
===================================================== */

function novaReceita() {

    window.location.href =
        "cadastrar-atividade.html";

}


/* =====================================================
   SAIR
===================================================== */

function sair() {

    fetch(`${API_URL}/Usuario/logout`, {

        method: "POST",

        credentials: "include"

    })

    .then(function () {

        window.location.href =
            "login.html";

    })

    .catch(function (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

        window.location.href =
            "login.html";

    });

}