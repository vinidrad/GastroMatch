
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
        document.getElementById("atividade-nome").textContent =
            "Atividade não encontrada";
        mostrarMensagem("Selecione um curso ou receita no catálogo.");
        botao.disabled = true;
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/Atividades`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar atividades.");
        }

        const atividades = await resposta.json();

        atividadeAtual = atividades.find(
            item => Number(item.id) === Number(id)
        );

        if (!atividadeAtual) {
            throw new Error("Essa atividade não foi encontrada.");
        }

        const nome = atividadeAtual.nome || "Atividade";
        const tipo = Number(atividadeAtual.tipo) === 2
            ? "Receita"
            : "Curso";

        document.getElementById("atividade-nome").textContent = nome;
        document.getElementById("resumo-nome").textContent = nome;

        const img = document.getElementById("atividade-imagem");
        img.src = atividadeAtual.imagem || "";
        img.alt = nome;

        const aulas = Array.isArray(atividadeAtual.aulas)
            ? atividadeAtual.aulas.length
            : atividadeAtual.quantidadeAulas
                ?? atividadeAtual.quantidade_aulas
                ?? null;

        document.getElementById("atividade-aulas").textContent =
            aulas !== null
                ? `${aulas} ${Number(aulas) === 1 ? "aula" : "aulas"}`
                : "";

        const duracao = atividadeAtual.tempo_Curso
            ?? atividadeAtual.tempoCurso
            ?? atividadeAtual.duracao
            ?? "";

        document.getElementById("atividade-duracao").textContent =
            duracao
                ? `Duração: ${duracao}`
                : "";

        document.getElementById("btn-finalizar").disabled = false;

    } catch (erro) {
        console.error(erro);
        document.getElementById("atividade-nome").textContent =
            "Não foi possível carregar";
        mostrarMensagem("Confira se a API está funcionando.");
        botao.disabled = true;
    }
}

function configurarFormasPagamento() {
    document.querySelectorAll(".forma").forEach(botao => {
        botao.addEventListener("click", () => {
            document.querySelectorAll(".forma").forEach(item => {
                item.classList.remove("selecionada");
            });

            botao.classList.add("selecionada");
            formaSelecionada = botao.dataset.forma;

            const camposCartao =
                document.querySelector(".dados-cartao");
            const parcelamento =
                document.getElementById("parcelamento");

            const usarCartao =
                formaSelecionada === "credito" ||
                formaSelecionada === "debito";

            camposCartao.style.opacity = usarCartao ? "1" : "0.35";
            parcelamento.style.opacity =
                formaSelecionada === "credito" ? "1" : "0.35";
        });
    });

    document.querySelector('[data-forma="credito"]')
        ?.classList.add("selecionada");
}

async function finalizarCompra() {
    if (!atividadeAtual || finalizando) return;

    finalizando = true;

    const botao = document.getElementById("btn-finalizar");
    botao.disabled = true;
    botao.textContent = "Finalizando...";
    mostrarMensagem("");

    try {
        // Esta rota precisa existir no backend e registrar a compra
        // para o usuário autenticado.
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
            console.error("Resposta da API:", detalhe);
            throw new Error("Não foi possível registrar a compra.");
        }

        mostrarMensagem("Compra registrada com sucesso!", true);

        setTimeout(() => {
            location.href = Number(atividadeAtual.tipo) === 2
                ? "perfil.html?aba=receitas"
                : "perfil.html?aba=cursos";
        }, 1200);

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


function configurarFormasPagamento() {
    const botoes = document.querySelectorAll(".forma");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            botoes.forEach(item =>
                item.classList.remove("selecionada")
            );

            botao.classList.add("selecionada");

            const forma = botao.dataset.forma;

            document.getElementById("painel-cartao").hidden =
                forma !== "credito";

            document.getElementById("painel-pix").hidden =
                forma !== "pix";

            document.getElementById("painel-boleto").hidden =
                forma !== "boleto";
        });
    });
}

function gerarQrCodeDemonstrativo() {
    const grade = document.getElementById("qr-falso");
    if (!grade) return;

    grade.innerHTML = "";

    // Padrão visual aleatório: NÃO é um QR Code de pagamento real.
    let semente = 20261020;

    function proximoBit() {
        semente = (semente * 9301 + 49297) % 233280;
        return semente / 233280 > 0.5;
    }

    for (let y = 0; y < 21; y++) {
        for (let x = 0; x < 21; x++) {
            const celula = document.createElement("span");

            const dentroMarcador =
                (x < 7 && y < 7) ||
                (x > 13 && y < 7) ||
                (x < 7 && y > 13);

            let escuro = proximoBit();

            // Três marcadores quadrados para lembrar um QR Code.
            if (dentroMarcador) {
                const px = x > 13 ? x - 14 : x;
                const py = y > 13 ? y - 14 : y;

                escuro =
                    px === 0 || px === 6 ||
                    py === 0 || py === 6 ||
                    (px >= 2 && px <= 4 &&
                     py >= 2 && py <= 4);
            }

            if (escuro) {
                celula.classList.add("escuro");
            }

            grade.appendChild(celula);
        }
    }
}
 v 

document.addEventListener("DOMContentLoaded", () => {
    carregarAtividade();
    configurarFormasPagamento();

    document.getElementById("btn-finalizar")
        .addEventListener("click", finalizarCompra);
});
