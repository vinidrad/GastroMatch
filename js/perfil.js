const API_URL = "https://localhost:7218";

let usuarioAtual = null;

document.addEventListener("DOMContentLoaded", function () {

    carregarPerfil();

    configurarMenu();

});


/* =========================================================
   PERFIL
========================================================= */

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

            if (!usuario) return;

            usuarioAtual = usuario;

            preencherPerfil(usuario);

            mostrarCursos();

        })

        .catch(function (erro) {

            console.error("Erro ao carregar perfil:", erro);

        });

}


/* =========================================================
   PREENCHER PERFIL
========================================================= */

function preencherPerfil(usuario) {

    const nomeUsuario =
        document.getElementById("nomeUsuario");

    if (nomeUsuario) {

        nomeUsuario.textContent =
            usuario.nome || "Usuário";

    }


    const descricaoUsuario =
        document.getElementById("descricaoUsuario");

    if (descricaoUsuario) {

        descricaoUsuario.textContent =
            usuario.bio ||
            "Bem-vindo ao GastroMatch! Fale mais sobre você.";

    }


    const fotoPerfil =
        document.getElementById("fotoPerfil");

    if (fotoPerfil) {

        if (usuario.foto_perfil) {

            fotoPerfil.style.backgroundImage =
                `url('${API_URL}${usuario.foto_perfil}')`;

            fotoPerfil.style.backgroundSize = "cover";

            fotoPerfil.style.backgroundPosition = "center";

            fotoPerfil.style.backgroundRepeat = "no-repeat";

        } else {

            fotoPerfil.style.backgroundImage = "none";

        }

    }


    configurarPendencia(usuario);

}


/* =========================================================
   BOLINHA DE PENDÊNCIA
========================================================= */

function configurarPendencia(usuario) {

    const bolinha =
        document.getElementById("bolinhaPendente");

    if (!bolinha) return;

    let pendente = false;


    if (
        usuario.chef === true &&
        usuario.statusCertificado === "Pendente"
    ) {

        pendente = true;

    }


    if (
        usuario.restaurante === true &&
        usuario.statusCnpj === "Pendente"
    ) {

        pendente = true;

    }


    bolinha.style.display =
        pendente ? "block" : "none";

}


/* =========================================================
   MENU
========================================================= */

function configurarMenu() {

    const btnCursos =
        document.getElementById("btnCursos");

    const btnReceitas =
        document.getElementById("btnReceitas");

    const btnFavoritos =
        document.getElementById("btnFavoritos");

    const btnSair =
        document.getElementById("btnSair");


    if (btnCursos) {

        btnCursos.addEventListener("click", function (evento) {

            evento.preventDefault();

            mostrarCursos();

        });

    }


    if (btnReceitas) {

        btnReceitas.addEventListener("click", function (evento) {

            evento.preventDefault();

            mostrarReceitas();

        });

    }


    if (btnFavoritos) {

        btnFavoritos.addEventListener("click", function (evento) {

            evento.preventDefault();

            mostrarFavoritos();

        });

    }


    if (btnSair) {

        btnSair.addEventListener("click", function (evento) {

            evento.preventDefault();

            sair();

        });

    }

}


/* =========================================================
   CURSOS
========================================================= */

function mostrarCursos() {

    const titulo =
        document.getElementById("tituloConteudo");

    const btnNovo =
        document.getElementById("btnNovo");


    titulo.textContent = "Cursos";


    /*
        Chef/Restaurante:
        mostra os cursos cadastrados por ele.

        Cliente:
        mostra os cursos que ele comprou.
    */

    let url = "";


    if (
        usuarioAtual &&
        usuarioAtual.cliente === true
    ) {

        url = `${API_URL}/Usuario/cursos`;

        if (btnNovo) {

            btnNovo.style.display = "none";

        }

    } else {

        url = `${API_URL}/Usuario/cursos`;

        if (btnNovo) {

            btnNovo.style.display = "block";

            btnNovo.textContent = "Novo curso";

            btnNovo.onclick = novoCurso;

        }

    }


    carregarAtividades(url, "curso");

}


/* =========================================================
   RECEITAS
========================================================= */

function mostrarReceitas() {

    const titulo =
        document.getElementById("tituloConteudo");

    const btnNovo =
        document.getElementById("btnNovo");


    titulo.textContent = "Receitas";


    /*
        Chef/Restaurante:
        mostra as receitas cadastradas por ele.

        Cliente:
        mostra as receitas que ele comprou.
    */


    if (
        usuarioAtual &&
        usuarioAtual.cliente === true
    ) {

        if (btnNovo) {

            btnNovo.style.display = "none";

        }

    } else {

        if (btnNovo) {

            btnNovo.style.display = "block";

            btnNovo.textContent = "Nova receita";

            btnNovo.onclick = novaReceita;

        }

    }


    carregarAtividades(
        `${API_URL}/Usuario/receitas`,
        "receita"
    );

}


/* =========================================================
   FAVORITOS
========================================================= */

function mostrarFavoritos() {

    const titulo =
        document.getElementById("tituloConteudo");

    const btnNovo =
        document.getElementById("btnNovo");


    titulo.textContent = "Favoritos";


    if (btnNovo) {

        btnNovo.style.display = "none";

    }


    /*
        Aqui não importa se é:

        Chef
        Restaurante
        Cliente

        Todos veem aquilo que salvaram
        usando o coração.
    */

    carregarAtividades(
        `${API_URL}/Usuario/salvos`,
        "salvo"
    );

}


/* =========================================================
   BUSCAR ATIVIDADES
========================================================= */

function carregarAtividades(url, tipo) {

    const area =
        document.getElementById("areaConteudo");


    if (!area) return;


    area.innerHTML = `
        <div class="carregando">
            Carregando...
        </div>
    `;


    fetch(url, {

        method: "GET",

        credentials: "include"

    })

        .then(function (resposta) {

            if (!resposta.ok) {

                throw new Error(
                    "Erro ao carregar atividades."
                );

            }

            return resposta.json();

        })

        .then(function (atividades) {

            if (
                !atividades ||
                atividades.length === 0
            ) {

                mostrarVazio(tipo);

                return;

            }


            criarCards(atividades);

        })

        .catch(function (erro) {

            console.error(erro);

            area.innerHTML = `
                <div class="mensagem-vazia">
                    <h3>Não foi possível carregar.</h3>
                    <p>Tente novamente mais tarde.</p>
                </div>
            `;

        });

}


/* =========================================================
   CRIAR CARDS
========================================================= */

function criarCards(atividades) {

    const area =
        document.getElementById("areaConteudo");


    area.innerHTML = "";


    const grid =
        document.createElement("div");

    grid.className = "perfil-grid";


    atividades.forEach(function (atividade) {

        

        const card =
            document.createElement("article");

        card.className = "perfil-card";
  

        const link =
            document.createElement("a");

        /*
            Depois podemos trocar para a página
            de detalhes da atividade.
        */

        link.href =
            `atividade.html?id=${atividade.id}`;


        const imagem =
            document.createElement("div");

        imagem.className =
            "perfil-card-imagem";


        const img =
            document.createElement("img");


       if (atividade.imagem) {
    img.src = `${API_URL}/uploads/capas/${atividade.imagem}`;
} else {
    img.src = "../img/imagem-padrao.jpg";
}


        img.alt =
            atividade.nome || "Atividade";


        const titulo =
            document.createElement("h3");


        titulo.textContent =
            atividade.nome || "Sem nome";


        imagem.appendChild(img);

        link.appendChild(imagem);

        link.appendChild(titulo);

        card.appendChild(link);

        grid.appendChild(card);

    });


    area.appendChild(grid);

}


/* =========================================================
   MENSAGEM VAZIA
========================================================= */

function mostrarVazio(tipo) {

    const area =
        document.getElementById("areaConteudo");


    let titulo = "";

    let texto = "";


    if (tipo === "curso") {

        if (
            usuarioAtual &&
            usuarioAtual.cliente === true
        ) {

            titulo =
                "Você ainda não comprou nenhum curso.";

            texto =
                "Quando você comprar um curso, ele aparecerá aqui.";

        } else {

            titulo =
                "Você ainda não criou nenhum curso.";

            texto =
                'Clique em "Novo curso" para cadastrar seu primeiro curso.';

        }

    }


    if (tipo === "receita") {

        if (
            usuarioAtual &&
            usuarioAtual.cliente === true
        ) {

            titulo =
                "Você ainda não comprou nenhuma receita.";

            texto =
                "Quando você comprar uma receita, ela aparecerá aqui.";

        } else {

            titulo =
                "Você ainda não criou nenhuma receita.";

            texto =
                "Quando você cadastrar uma receita, ela aparecerá aqui.";

        }

    }


    if (tipo === "salvo") {

        titulo =
            "Você ainda não salvou nada.";

        texto =
            "Clique no coração de um curso ou receita para salvar e comprar depois.";

    }


    area.innerHTML = `
        <div class="mensagem-vazia">

            <h3>${titulo}</h3>

            <p>${texto}</p>

        </div>
    `;

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function novoCurso() {

    window.location.href =
        "criar.html";

}


function novaReceita() {

    window.location.href =
        "cadastrar-atividade.html";

}


function abrirInformacoes() {

    window.location.href =
        "editarperfil.html";

}


function abrirperfil() {

    window.location.href =
        "perfil.html";

}


/* =========================================================
   SAIR
========================================================= */

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