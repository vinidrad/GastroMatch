
const API_URL = "https://localhost:7218";

// ========================================
// CATEGORIAS DO BANCO → IDs DO HTML
// ========================================

const categorias = {
    "Massas": "Massas",
    "Doces": "doces",
    "Comidas rapidas": "rapidas",
    "Confeitaria": "confeitaria",
    "Panificação": "panificacao",
    "Comida Brasileira": "brasileiras",
    "Bebidas": "bebidas",
    "Molhos": "molhos",
    "Comida Italiana": "italiana"
};


// ========================================
// CARREGAR ATIVIDADES
// ========================================

async function carregarAtividades() {

    try {

        const resposta = await fetch(`${API_URL}/Atividades`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar atividades.");
        }

        const atividades = await resposta.json();

        console.log("Atividades recebidas:", atividades);

        // Limpa os cards antes de adicionar
        document.querySelectorAll(".catalog-grid").forEach(grid => {
            grid.innerHTML = "";
        });

        // Adiciona cada atividade na categoria correta
        atividades.forEach(atividade => {

            const idCategoria = categorias[atividade.categoria];

            // Se a categoria não existir no mapa, ignora
            if (!idCategoria) {
                console.warn(
                    "Categoria não encontrada no catálogo:",
                    atividade.categoria
                );
                return;
            }

            const grid = document.getElementById(idCategoria);

            if (!grid) {
                console.warn(
                    "Elemento da categoria não encontrado:",
                    idCategoria
                );
                return;
            }

            // Cria o card
            const card = document.createElement("article");

            card.className = "catalog-card";

            card.innerHTML = `
                <a href="Compra.html?id=${atividade.id}">

                    <div class="catalog-image">

                        ${
                            atividade.imagem
                            ? `<img 
                                src="${atividade.imagem}" 
                                alt="${atividade.nome}"
                              >`
                            : `<div class="sem-imagem">
                                Sem imagem
                              </div>`
                        }

                        <button 
                            type="button"
                            class="favorito"
                            aria-label="Adicionar aos favoritos"
                            onclick="event.preventDefault(); event.stopPropagation();"
                        >
                            <span class="material-symbols-outlined">
                                favorite
                            </span>
                        </button>

                    </div>

                    <h3>${atividade.nome}</h3>

                </a>
            `;

            grid.appendChild(card);
        });

    } catch (erro) {

        console.error("Erro ao carregar atividades:", erro);

    }
}


// ========================================
// PESQUA
// ========================================

function configurarBusca() {

    const campoBusca = document.getElementById("buscar-curso");

    if (!campoBusca) {
        return;
    }

    campoBusca.addEventListener("input", function () {

        const texto = this.value
            .toLowerCase()
            .trim();

        document.querySelectorAll(".catalog-card").forEach(card => {

            const nome = card
                .querySelector("h3")
                ?.textContent
                .toLowerCase() || "";

            if (nome.includes(texto)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

}


// ========================================
// CARROSSEL
// ========================================

function configurarCarrosseis() {

    document.querySelectorAll(".category-row").forEach(categoria => {

        const grid = categoria.querySelector(".catalog-grid");

        const botoes = categoria.querySelectorAll(".carousel-button");

        if (!grid || botoes.length < 2) {
            return;
        }

        const botaoEsquerda = botoes[0];
        const botaoDireita = botoes[1];

        botaoEsquerda.addEventListener("click", function () {

            grid.scrollBy({
                left: -400,
                behavior: "smooth"
            });

        });

        botaoDireita.addEventListener("click", function () {

            grid.scrollBy({
                left: 400,
                behavior: "smooth"
            });

        });

    });

}


// ========================================
// INICIAR
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    carregarAtividades();

    configurarBusca();

    configurarCarrosseis();

});

