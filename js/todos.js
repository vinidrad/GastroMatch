const API_URL = "https://localhost:7218";

let atividadesCategoria = [];


async function carregarAtividades() {

    try {

        const resposta = await fetch(`${API_URL}/Atividades`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar atividades.");
        }

        const atividades = await resposta.json();

        // Pega a categoria da URL
        const parametros = new URLSearchParams(window.location.search);
        const categoria = parametros.get("categoria");

        console.log("Categoria escolhida:", categoria);

        // Tipo 1 = curso
        atividadesCategoria = atividades.filter(atividade =>
            Number(atividade.tipo) === 1 &&
            atividade.categoria === categoria
        );

        mostrarAtividades(atividadesCategoria);

    } catch (erro) {

        console.error("Erro ao carregar atividades:", erro);

    }
}


function mostrarAtividades(atividades) {

    const container = document.getElementById("todos-cursos");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    atividades.forEach(atividade => {

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

}


document.addEventListener(
    "DOMContentLoaded",
    carregarAtividades
);