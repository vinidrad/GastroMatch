const API_URL = "https://localhost:7218";
const ROTA_REGISTRAR_COMPRA = `${API_URL}/Compra`;

let atividadeAtual = null;
let formaSelecionada = "credito";
let finalizando = false;

function mostrarMensagem(texto, sucesso = false) {
    const elemento = document.getElementById("mensagem-checkout");
    elemento.textContent = texto;
    elemento.classList.toggle("sucesso", sucesso);
}

async function carregarAtividade() {
    const id = new URLSearchParams(location.search).get("id");
    const botao = document.getElementById("btn-finalizar");

    if (!id) {
        document.getElementById("atividade-nome").textContent = "Atividade não encontrada";
        mostrarMensagem("Selecione um curso ou receita no catálogo.");
        botao.disabled = true;
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/Atividades`);
        if (!resposta.ok) throw new Error("Erro ao carregar atividades.");

        const atividades = await resposta.json();
        atividadeAtual = atividades.find(item => Number(item.id) === Number(id));
        if (!atividadeAtual) throw new Error("Essa atividade não foi encontrada.");

        const nome = atividadeAtual.nome || "Atividade";
        document.getElementById("atividade-nome").textContent = nome;
        document.getElementById("resumo-nome").textContent = nome;

        const img = document.getElementById("atividade-imagem");
        img.src = atividadeAtual.imagem || "";
        img.alt = nome;

        const aulas = Array.isArray(atividadeAtual.aulas)
            ? atividadeAtual.aulas.length
            : atividadeAtual.quantidadeAulas ?? atividadeAtual.quantidade_aulas ?? null;
        document.getElementById("atividade-aulas").textContent =
            aulas !== null ? `${aulas} ${Number(aulas) === 1 ? "aula" : "aulas"}` : "";

        const duracao = atividadeAtual.tempo_Curso ?? atividadeAtual.tempoCurso ?? atividadeAtual.duracao ?? "";
        document.getElementById("atividade-duracao").textContent = duracao ? `Duração: ${duracao}` : "";
        botao.disabled = false;
    } catch (erro) {
        console.error(erro);
        document.getElementById("atividade-nome").textContent = "Não foi possível carregar";
        mostrarMensagem("Confira se a API está funcionando.");
        botao.disabled = true;
    }
}

function selecionarFormaPagamento(forma) {
    formaSelecionada = forma;
    document.querySelectorAll(".forma").forEach(botao => {
        const selecionado = botao.dataset.forma === forma;
        botao.classList.toggle("selecionada", selecionado);
        botao.setAttribute("aria-pressed", String(selecionado));
    });

    document.getElementById("painel-cartao").hidden = forma !== "credito";
    document.getElementById("painel-pix").hidden = forma !== "pix";
    document.getElementById("painel-boleto").hidden = forma !== "boleto";
    document.querySelector(".resumo").hidden = forma !== "credito";
}

function configurarFormasPagamento() {
    document.querySelectorAll(".forma").forEach(botao => {
        botao.addEventListener("click", () => selecionarFormaPagamento(botao.dataset.forma));
    });
    selecionarFormaPagamento("credito");
}

function configurarCopia() {
    document.getElementById("copiar-pix")?.addEventListener("click", async () => {
        await copiarTexto(document.getElementById("codigo-pix").value, "Código Pix demonstrativo copiado.");
    });
    document.getElementById("copiar-boleto")?.addEventListener("click", async () => {
        const linha = document.querySelector(".linha-digitavel").textContent.trim();
        await copiarTexto(linha, "Linha digitável demonstrativa copiada.");
    });
}

async function copiarTexto(texto, mensagem) {
    try {
        await navigator.clipboard.writeText(texto);
        mostrarMensagem(mensagem, true);
    } catch {
        mostrarMensagem("Não foi possível copiar automaticamente. Selecione e copie o código.");
    }
}

async function finalizarCompra() {
    if (!atividadeAtual || finalizando) return;
    finalizando = true;

    const botao = document.getElementById("btn-finalizar");
    botao.disabled = true;
    botao.textContent = "Finalizando...";
    mostrarMensagem("");

 
    try {
        const resposta = await fetch(ROTA_REGISTRAR_COMPRA, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                atividadeId: Number(atividadeAtual.id)
            })
        });

         if (resposta.status === 401) {
            mostrarMensagem("Entre na sua conta para continuar.");
            return;
        }

        if (!resposta.ok) {
            const detalhe = await resposta.text();
            console.error("Erro da API:", detalhe);
            throw new Error(
                detalhe || "Não foi possível registrar a compra."
            );
        }

        mostrarMensagem(
            "Curso adquirido com sucesso! Ele já é seu.",
            true
        );

        setTimeout(() => {
            location.href = Number(atividadeAtual.tipo) === 2
                ? "perfil.html?aba=receitas"
                : "perfil.html?aba=cursos";
        }, 1000);

    } catch (erro) {
        console.error(erro);
        mostrarMensagem(
            erro.message || "Erro ao finalizar a compra."
        );
    } finally {
        finalizando = false;
        botao.disabled = false;
        botao.textContent = "Finalizar";
    }
}

function gerarQrDemonstrativo() {
    const qr = document.getElementById("qr-falso");
    if (!qr) return;
    const tamanho = 21;
    const eLocalizador = (x, y) =>
        (x < 7 && y < 7) || (x >= tamanho - 7 && y < 7) || (x < 7 && y >= tamanho - 7);

    for (let y = 0; y < tamanho; y++) {
        for (let x = 0; x < tamanho; x++) {
            const celula = document.createElement("span");
            let escura;
            if (eLocalizador(x, y)) {
                const lx = x < 7 ? x : x - (tamanho - 7);
                const ly = y < 7 ? y : y - (tamanho - 7);
                escura = lx === 0 || lx === 6 || ly === 0 || ly === 6 ||
                    (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
            } else {
                escura = ((x * 13 + y * 7 + x * y) % 11) < 5;
            }
            if (escura) celula.classList.add("escuro");
            qr.appendChild(celula);
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    carregarAtividade();
    configurarFormasPagamento();
    configurarCopia();
    gerarQrDemonstrativo();
    document.getElementById("btn-finalizar").addEventListener("click", finalizarCompra);
});

