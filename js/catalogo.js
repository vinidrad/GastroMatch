const API_URL = "https://localhost:7218";

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


async function carregarAtividades() {

    try {

        const resposta = await fetch(`${API_URL}/Atividades`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar atividades.");
        }

        const atividades = await resposta.json();

        atividades.forEach(atividade => {

            const idCategoria = categorias[atividade.categoria];

            if (!idCategoria) {
                console.warn(
                    `Categoria "${atividade.categoria}" não possui uma área no catálogo.`
                );
                return;
            }

            const container = document.getElementById(idCategoria);

            if (!container) {
                return;
            }

            const card = document.createElement("article");

            card.className = "catalog-card";

            card.innerHTML = `
                <a href="Compra.html?id=${atividade.id}">

                    <div class="catalog-image">

                        <img
                            src="${atividade.imagem}"
                            alt="${atividade.nome}"
                        >

                        <span class="material-symbols-outlined">
                            favorite_border
                        </span>

                    </div>

                    <h3>${atividade.nome}</h3>

                </a>
            `;

            container.appendChild(card);

        });

        configurarCarrosseis();

    } catch (erro) {

        console.error("Erro ao carregar atividades:", erro);

    }
}


function configurarCarrosseis() {

    const categorias = document.querySelectorAll(".category-row");

    categorias.forEach(categoria => {

        const grid = categoria.querySelector(".catalog-grid");

        const botoes = categoria.querySelectorAll(".carousel-button");

        if (!grid || botoes.length < 2) {
            return;
        }

        const botaoEsquerda = botoes[0];
        const botaoDireita = botoes[1];

        botaoEsquerda.addEventListener("click", () => {

            grid.scrollBy({
                left: -grid.clientWidth,
                behavior: "smooth"
            });

        });

        botaoDireita.addEventListener("click", () => {

            grid.scrollBy({
                left: grid.clientWidth,
                behavior: "smooth"
            });

        });

    });

}


document.addEventListener("DOMContentLoaded", carregarAtividades);