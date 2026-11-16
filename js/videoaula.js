
const API_URL = "https://localhost:7218";

let cursoAtual = null;
let aulasCurso = [];
let aulaAtualIndex = 0;

const aulasConcluidas = new Set();

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", carregarCurso);


// ========================================
// CARREGAR CURSO
// ========================================

async function carregarCurso() {

    const cursoId =
        new URLSearchParams(window.location.search).get("id");

    if (!cursoId) {

        mostrarErro("ID do curso não informado na URL.");

        return;

    }

    try {

        const resposta = await fetch(
            `${API_URL}/Atividades/${cursoId}`,
            {
                credentials: "include"
            }
        );

        if (!resposta.ok) {

            throw new Error(`Erro HTTP ${resposta.status}`);

        }

        cursoAtual = await resposta.json();

        aulasCurso =
            cursoAtual.aulas ?? cursoAtual.Aulas ?? [];

        $("nomeCurso").textContent =
            cursoAtual.nome ??
            cursoAtual.Nome ??
            "Curso sem nome";

        $("descricaoCurso").textContent =
            cursoAtual.sobre ??
            cursoAtual.Sobre ??
            cursoAtual.descricao ??
            cursoAtual.Descricao ??
            "Nenhuma descrição disponível.";

        if (!aulasCurso.length) {

            $("listaAulas").innerHTML =
                '<p class="aviso">Este curso ainda não possui aulas.</p>';

            $("playerContainer").innerHTML =
                '<p class="aviso">Nenhum vídeo disponível.</p>';

            return;

        }

        renderizarListaAulas();

        selecionarAula(0);

        atualizarProgresso();

    } catch (erro) {

        console.error("Erro ao carregar curso:", erro);

        mostrarErro(
            "Não foi possível carregar o curso. Confira se a API está ligada."
        );

    }

}


// ========================================
// OBTER ID DO YOUTUBE
// ========================================

function obterIdYoutube(link) {

    try {

        const url = new URL(link);

        const host = url.hostname.toLowerCase();

        let id = "";

        if (
            host === "youtu.be" ||
            host === "www.youtu.be"
        ) {

            id = url.pathname.split("/")[1];

        }
        else if ([
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com",
            "youtube-nocookie.com",
            "www.youtube-nocookie.com"
        ].includes(host)) {

            if (url.pathname === "/watch") {

                id = url.searchParams.get("v");

            }
            else if (
                url.pathname.startsWith("/embed/") ||
                url.pathname.startsWith("/shorts/") ||
                url.pathname.startsWith("/live/")
            ) {

                id = url.pathname.split("/")[2];

            }

        }

        if (
            !id ||
            !/^[a-zA-Z0-9_-]{11}$/.test(id)
        ) {

            return null;

        }

        return id;

    } catch {

        return null;

    }

}


// ========================================
// RENDERIZAR LISTA DE AULAS
// ========================================

function renderizarListaAulas() {

    const lista = $("listaAulas");

    lista.replaceChildren();

    aulasCurso.forEach((aula, index) => {

        const item = document.createElement("button");

        item.type = "button";

        item.className = "item-aula";

        const titulo = document.createElement("span");

        titulo.className = "item-aula-titulo";

        titulo.textContent =
            aula.titulo ??
            aula.Titulo ??
            `Aula ${index + 1}`;

        const numero = document.createElement("span");

        numero.className = "item-aula-numero";

        numero.textContent =
            `Aula ${aula.ordem ?? aula.Ordem ?? index + 1}`;

        item.append(numero, titulo);

        item.addEventListener(
            "click",
            () => selecionarAula(index)
        );

        lista.appendChild(item);

    });

}


// ========================================
// SELECIONAR AULA
// ========================================

function selecionarAula(index) {

    if (
        index < 0 ||
        index >= aulasCurso.length
    ) return;

    aulaAtualIndex = index;

    const aula = aulasCurso[index];

    const tituloAula =
        aula.titulo ??
        aula.Titulo ??
        `Aula ${index + 1}`;

    const linkVideo =
        aula.video ??
        aula.Video;

    $("nomeAula").textContent = tituloAula;

    const playerContainer =
        $("playerContainer");

    playerContainer.replaceChildren();


    // ========================================
    // VERIFICAR LINK
    // ========================================

    if (!linkVideo) {

        const aviso = document.createElement("p");

        aviso.className = "aviso";

        aviso.textContent =
            "Esta aula não possui um link de vídeo.";

        playerContainer.appendChild(aviso);

        $("btnConcluirAula").disabled = true;

        console.error(
            "Campo de vídeo ausente na aula:",
            aula
        );

        atualizarListaSelecionada();

        return;

    }


    // ========================================
    // OBTER ID DO YOUTUBE
    // ========================================

    const idYoutube =
        obterIdYoutube(linkVideo);

    if (!idYoutube) {

        const aviso = document.createElement("p");

        aviso.className = "aviso";

        aviso.textContent =
            "O link do vídeo desta aula é inválido.";

        playerContainer.appendChild(aviso);

        $("btnConcluirAula").disabled = true;

        console.error(
            "Link do YouTube inválido:",
            linkVideo
        );

        atualizarListaSelecionada();

        return;

    }


    // ========================================
    // PLAYER DO YOUTUBE
    // ========================================

    const player =
        document.createElement("iframe");

    player.src =
        `https://www.youtube.com/embed/${idYoutube}`;

    player.title = tituloAula;

    player.width = "100%";

    player.height = "100%";

    player.style.width = "100%";

    player.style.height = "100%";

    player.style.border = "none";

    player.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );

    player.setAttribute(
        "allowfullscreen",
        ""
    );

    player.setAttribute(
        "referrerpolicy",
        "strict-origin-when-cross-origin"
    );

    player.setAttribute(
        "loading",
        "lazy"
    );

    playerContainer.appendChild(player);


    // ========================================
    // CONCLUSÃO
    // ========================================

    const idAula =
        aula.id ?? aula.Id;

    $("btnConcluirAula").disabled =
        aulasConcluidas.has(idAula);

    $("mensagem").textContent = "";

    atualizarListaSelecionada();

}


// ========================================
// ATUALIZAR AULA SELECIONADA
// ========================================

function atualizarListaSelecionada() {

    const itens =
        $("listaAulas").querySelectorAll(".item-aula");

    itens.forEach((item, index) => {

        const aula = aulasCurso[index];

        const idAula =
            aula.id ?? aula.Id;

        item.classList.toggle(
            "ativa",
            index === aulaAtualIndex
        );

        item.classList.toggle(
            "concluida",
            aulasConcluidas.has(idAula)
        );

    });

}


// ========================================
// CONCLUIR AULA
// ========================================

$("btnConcluirAula").addEventListener(
    "click",
    () => {

        const aula =
            aulasCurso[aulaAtualIndex];

        if (!aula) return;

        const idAula =
            aula.id ?? aula.Id;

        aulasConcluidas.add(idAula);

        $("btnConcluirAula").disabled = true;

        $("mensagem").textContent =
            "Aula concluída!";

        atualizarListaSelecionada();

        atualizarProgresso();

    }
);


// ========================================
// PROGRESSO
// ========================================

function atualizarProgresso() {

    const total = aulasCurso.length;

    const concluidas = aulasConcluidas.size;

    const porcentagem =
        total ? (concluidas / total) * 100 : 0;

    $("textoProgresso").textContent =
        `${Math.round(porcentagem)}%`;

    $("barraProgresso").style.width =
        `${porcentagem}%`;

}


// ========================================
// MOSTRAR ERRO
// ========================================

function mostrarErro(mensagem) {

    $("nomeCurso").textContent =
        "Erro ao carregar curso";

    $("descricaoCurso").textContent =
        mensagem;

    $("listaAulas").innerHTML = "";

    const aviso =
        document.createElement("p");

    aviso.className = "aviso";

    aviso.textContent = mensagem;

    $("listaAulas").appendChild(aviso);

    $("playerContainer").replaceChildren();

}
