
const API_URL = "https://localhost:7218";

let perguntas = [];
let filtroAtual = "recentes";

const lista = document.getElementById("listaPerguntas");
const pesquisa = document.getElementById("campoPesquisa");
const totalPerguntas = document.getElementById("totalPerguntas");
const formPergunta = document.getElementById("formPergunta");
const mensagemPergunta = document.getElementById("mensagemPergunta");

document.addEventListener("DOMContentLoaded", carregarPerguntas);

async function carregarPerguntas() {
    lista.innerHTML = '<div class="estado-vazio">Carregando perguntas...</div>';

    try {
        const resposta = await fetch(`${API_URL}/Comunidade`, {
            credentials: "include"
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        perguntas = await resposta.json();
        renderizarPerguntas();
    } catch (erro) {
        console.error("Erro ao carregar a comunidade:", erro);

        lista.innerHTML = `
            <div class="estado-vazio">
                Não foi possível carregar as perguntas.<br>
                Verifique se a API está rodando e se o endpoint /Comunidade existe.
            </div>`;
    }
}

function renderizarPerguntas() {
    const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");

    let resultado = perguntas.filter(p => {
        const assunto = String(p.assunto ?? p.Assunto ?? "");
        const texto = String(p.pergunta ?? p.Pergunta ?? "");
      const autor = String(p.nomeUsuario ?? p.NomeUsuario ?? "Usuário");

        return `${assunto} ${texto} ${autor}`
            .toLocaleLowerCase("pt-BR")
            .includes(termo);
    });

    resultado = resultado.filter(p => {
        const respostas = p.respostas ?? p.Respostas ?? [];

        if (filtroAtual === "respondidas") return respostas.length > 0;
        if (filtroAtual === "pendentes") return respostas.length === 0;

        return true;
    });

    totalPerguntas.textContent =
        `${resultado.length} ${resultado.length === 1 ? "pergunta" : "perguntas"}`;

    lista.replaceChildren();

    if (resultado.length === 0) {
        lista.innerHTML = `
            <div class="estado-vazio">
                Nenhuma pergunta encontrada.<br>
                Que tal publicar a primeira?
            </div>`;
        return;
    }

    resultado.forEach(p => lista.appendChild(criarCardPergunta(p)));
}

function criarCardPergunta(p) {
    const id = p.id ?? p.Id;
    const assunto = p.assunto ?? p.Assunto ?? "Sem assunto";
    const texto = p.pergunta ?? p.Pergunta ?? "";
    const usuario = p.nomeUsuario ?? p.NomeUsuario ?? "Usuário";
    const data = p.data ?? p.Data;
    const respostas = p.respostas ?? p.Respostas ?? [];

    const card = document.createElement("article");
    card.className = "pergunta-card";

    const topo = document.createElement("div");
    topo.className = "pergunta-topo";

    const autor = document.createElement("div");
    autor.className = "autor";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = String(usuario).trim().charAt(0).toUpperCase() || "?";

    const autorInfo = document.createElement("div");
    autorInfo.className = "autor-info";

    const nome = document.createElement("span");
    nome.className = "autor-nome";
    nome.textContent = usuario;

    const dataEl = document.createElement("span");
    dataEl.className = "data-pergunta";
    dataEl.textContent = formatarData(data);

    autorInfo.append(nome, dataEl);
    autor.append(avatar, autorInfo);

    const status = document.createElement("span");
    status.className = "status-pergunta";
    status.textContent = respostas.length
        ? `${respostas.length} ${respostas.length === 1 ? "resposta" : "respostas"}`
        : "Aguardando resposta";

    if (!respostas.length) status.classList.add("pendente");

    topo.append(autor, status);

    const titulo = document.createElement("h3");
    titulo.className = "pergunta-assunto";
    titulo.textContent = assunto;

    const descricao = document.createElement("p");
    descricao.className = "pergunta-texto";
    descricao.textContent = texto;

    const acoes = document.createElement("div");
    acoes.className = "pergunta-acoes";

    const contagem = document.createElement("span");
    contagem.className = "contagem-respostas";
    contagem.textContent = "Espaço para compartilhar conhecimento";

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-responder";
    botao.textContent = "Responder";

    acoes.append(contagem, botao);

    const listaRespostas = document.createElement("div");
    listaRespostas.className = "respostas";

    respostas.forEach(r => {
        listaRespostas.appendChild(criarCardResposta(r));
    });

    const form = document.createElement("form");
    form.className = "form-resposta";
    form.hidden = true;

    const campo = document.createElement("textarea");
    campo.maxLength = 2000;
    campo.required = true;
    campo.placeholder = "Escreva sua resposta...";

    const enviar = document.createElement("button");
    enviar.type = "submit";
    enviar.textContent = "Enviar resposta";

    const mensagem = document.createElement("p");
    mensagem.className = "mensagem-form";

    form.append(campo, enviar, mensagem);

    botao.addEventListener("click", () => {
        form.hidden = !form.hidden;

        if (!form.hidden) campo.focus();
    });

    form.addEventListener("submit", async evento => {
        evento.preventDefault();

        enviar.disabled = true;
        mensagem.textContent = "Enviando...";
        mensagem.className = "mensagem-form";

        try {
            const resposta = await fetch(`${API_URL}/Comunidade/respostas`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    perguntaId: Number(id),
                    resposta: campo.value.trim()
                })
            });

            if (!resposta.ok) {
                const erro = await resposta.text();
                throw new Error(
                    resposta.status === 401
                        ? "Faça login para responder."
                        : erro || `Erro HTTP ${resposta.status}`
                );
            }

            campo.value = "";
            form.hidden = true;
            await carregarPerguntas();
        } catch (erro) {
            mensagem.textContent = erro.message || "Não foi possível enviar a resposta.";
            mensagem.className = "mensagem-form erro";
        } finally {
            enviar.disabled = false;
        }
    });

    card.append(topo, titulo, descricao, acoes, listaRespostas, form);

    return card;
}

function criarCardResposta(r) {
    const usuario = r.nomeUsuario ?? r.NomeUsuario ?? "Usuário";
    const texto = r.resposta ?? r.Resposta ?? "";
    const data = r.data ?? r.Data;

    const card = document.createElement("div");
    card.className = "resposta-card";

    const topo = document.createElement("div");
    topo.className = "resposta-topo";

    const nome = document.createElement("strong");
    nome.textContent = usuario;

    const dataEl = document.createElement("span");
    dataEl.textContent = formatarData(data);

    topo.append(nome, dataEl);

    const corpo = document.createElement("p");
    corpo.className = "resposta-texto";
    corpo.textContent = texto;

    card.append(topo, corpo);

    return card;
}

formPergunta.addEventListener("submit", async evento => {
    evento.preventDefault();

    const assunto = document.getElementById("assunto").value.trim();
    const pergunta = document.getElementById("textoPergunta").value.trim();
    const botao = document.getElementById("btnPerguntar");

    if (!assunto || !pergunta) {
        mostrarMensagem("Preencha o assunto e a pergunta.", "erro");
        return;
    }

    botao.disabled = true;
    botao.textContent = "Publicando...";
    mostrarMensagem("", "");

    try {
        const resposta = await fetch(`${API_URL}/Comunidade/perguntas`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ assunto, pergunta })
        });

        if (!resposta.ok) {
            const erro = await resposta.text();

            throw new Error(
                resposta.status === 401
                    ? "Faça login para publicar uma pergunta."
                    : erro || `Erro HTTP ${resposta.status}`
            );
        }

        formPergunta.reset();
        mostrarMensagem("Pergunta publicada com sucesso!", "sucesso");
        filtroAtual = "recentes";

        document.querySelectorAll(".filtro").forEach(b => {
            b.classList.toggle("ativo", b.dataset.filtro === filtroAtual);
        });

        await carregarPerguntas();
    } catch (erro) {
        mostrarMensagem(
            erro.message || "Não foi possível publicar sua pergunta.",
            "erro"
        );
    } finally {
        botao.disabled = false;
        botao.textContent = "Publicar pergunta";
    }
});

function mostrarMensagem(texto, tipo) {
    mensagemPergunta.textContent = texto;
    mensagemPergunta.className = `mensagem-form ${tipo}`;
}

function formatarData(valor) {
    if (!valor) return "";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return "";

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

pesquisa.addEventListener("input", renderizarPerguntas);

document.querySelectorAll(".filtro").forEach(botao => {
    botao.addEventListener("click", () => {
        filtroAtual = botao.dataset.filtro;

        document.querySelectorAll(".filtro").forEach(b => {
            b.classList.toggle("ativo", b === botao);
        });

        renderizarPerguntas();
    });
});
