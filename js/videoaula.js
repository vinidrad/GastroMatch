
const API_URL = "https://localhost:7218";

let cursoAtual = null;
let aulasCurso = [];
let aulaAtualIndex = 0;
const aulasConcluidas = new Set();

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", carregarCurso);

async function carregarCurso() {
    const cursoId = new URLSearchParams(window.location.search).get("id");

    if (!cursoId) {
        mostrarErro("ID do curso não informado na URL.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/Atividades/${cursoId}`, {
            credentials: "include"
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        cursoAtual = await resposta.json();
        aulasCurso = cursoAtual.aulas ?? cursoAtual.Aulas ?? [];

        $("nomeCurso").textContent =
            cursoAtual.nome ?? cursoAtual.Nome ?? "Curso sem nome";

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
            aula.titulo ?? aula.Titulo ?? `Aula ${index + 1}`;

        const numero = document.createElement("span");
        numero.className = "item-aula-numero";
        numero.textContent = `Aula ${aula.ordem ?? aula.Ordem ?? index + 1}`;

        item.append(numero, titulo);
        item.addEventListener("click", () => selecionarAula(index));

        lista.appendChild(item);
    });
}

function selecionarAula(index) {
    if (index < 0 || index >= aulasCurso.length) return;

    aulaAtualIndex = index;

    const aula = aulasCurso[index];
    const tituloAula =
        aula.titulo ?? aula.Titulo ?? `Aula ${index + 1}`;

    const arquivoVideo = aula.video ?? aula.Video;

    $("nomeAula").textContent = tituloAula;

    const player = document.createElement("video");
    player.controls = true;
    player.playsInline = true;
    player.preload = "metadata";
    player.style.width = "100%";
    player.style.height = "100%";

    if (!arquivoVideo) {
        $("playerContainer").replaceChildren();

        const aviso = document.createElement("p");
        aviso.className = "aviso";
        aviso.textContent = "Esta aula não possui um arquivo de vídeo.";
        $("playerContainer").appendChild(aviso);

        $("btnConcluirAula").disabled = true;
        console.error("Campo de vídeo ausente na aula:", aula);
        atualizarListaSelecionada();
        return;
    }

    player.src =
        `${API_URL}/uploads/aulas/${encodeURIComponent(arquivoVideo)}`;

    player.addEventListener("error", () => {
        console.error("Falha ao carregar o vídeo:", player.currentSrc);

        $("mensagem").textContent =
            "Não foi possível reproduzir este vídeo. Confira se o arquivo existe na pasta uploads/aulas.";
    });

    player.addEventListener("loadedmetadata", () => {
        $("mensagem").textContent = "";
    });

    player.addEventListener("ended", () => {
        $("btnConcluirAula").disabled = false;
    });

    $("playerContainer").replaceChildren(player);

    const idAula = aula.id ?? aula.Id;
    $("btnConcluirAula").disabled = aulasConcluidas.has(idAula);
    $("mensagem").textContent = "";

    atualizarListaSelecionada();
}

function atualizarListaSelecionada() {
    const itens = $("listaAulas").querySelectorAll(".item-aula");

    itens.forEach((item, index) => {
        const aula = aulasCurso[index];
        const idAula = aula.id ?? aula.Id;

        item.classList.toggle("ativa", index === aulaAtualIndex);
        item.classList.toggle("concluida", aulasConcluidas.has(idAula));
    });
}

$("btnConcluirAula").addEventListener("click", () => {
    const aula = aulasCurso[aulaAtualIndex];
    if (!aula) return;

    const idAula = aula.id ?? aula.Id;
    aulasConcluidas.add(idAula);

    $("btnConcluirAula").disabled = true;
    $("mensagem").textContent = "Aula concluída!";

    atualizarListaSelecionada();
    atualizarProgresso();
});

function atualizarProgresso() {
    const total = aulasCurso.length;
    const concluidas = aulasConcluidas.size;
    const porcentagem = total ? (concluidas / total) * 100 : 0;

    $("textoProgresso").textContent = `${Math.round(porcentagem)}%`;
    $("barraProgresso").style.width = `${porcentagem}%`;
}

function mostrarErro(mensagem) {
    $("nomeCurso").textContent = "Erro ao carregar curso";
    $("descricaoCurso").textContent = mensagem;
    $("listaAulas").innerHTML = "";

    const aviso = document.createElement("p");
    aviso.className = "aviso";
    aviso.textContent = mensagem;

    $("listaAulas").appendChild(aviso);
    $("playerContainer").replaceChildren();
}
