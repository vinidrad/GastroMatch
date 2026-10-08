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

        const tipoPagina = Number(document.body.dataset.tipoAtividade);

        // Busca os favoritos do usuário
        let atividadesSalvas = [];

        try {

            const respostaSalvos = await fetch(
                `${API_URL}/Usuario/salvos`,
                {
                    credentials: "include"
                }
            );

            if (respostaSalvos.ok) {

                atividadesSalvas = await respostaSalvos.json();

            }

        } catch (erro) {

            console.log("Usuário não está logado ou não foi possível carregar os salvos.");

        }


        atividades.forEach(atividade => {

            // Filtra curso ou receita
            if (Number(atividade.tipo) !== tipoPagina) {
                return;
            }


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


            // Verifica se essa atividade está salva
            const estaSalva = atividadesSalvas.some(
                salvo => Number(salvo.id) === Number(atividade.id)
            );


            const card = document.createElement("article");

            card.className = "catalog-card";


            card.innerHTML = `

                <a href="Compra.html?id=${atividade.id}">

                    <div class="catalog-image">

                        <img
                            src="${atividade.imagem}"
                            alt="${atividade.nome}"
                        >

                        <span
                            class="material-symbols-outlined botao-favorito ${estaSalva ? "favoritado" : ""}"
                            data-id="${atividade.id}"
                        >
                            ${estaSalva ? "favorite" : "favorite_border"}
                        </span>

                    </div>

                    <h3>${atividade.nome}</h3>

                </a>

            `;


            container.appendChild(card);


            // Botão de favorito
            const botaoFavorito =
                card.querySelector(".botao-favorito");


            botaoFavorito.addEventListener("click", async (event) => {

                // Impede abrir Compra.html
                event.preventDefault();

                // Impede o clique de continuar subindo para o <a>
                event.stopPropagation();


                const atividadeId =
                    Number(botaoFavorito.dataset.id);


                const estaFavoritado =
                    botaoFavorito.classList.contains("favoritado");


                try {

                    let resposta;


                    if (estaFavoritado) {

                        // REMOVE DOS SALVOS

                        resposta = await fetch(
                            `${API_URL}/Usuario/salvar/${atividadeId}`,
                            {
                                method: "DELETE",
                                credentials: "include"
                            }
                        );

                    } else {

                        // SALVA

                        resposta = await fetch(
                            `${API_URL}/Usuario/salvar`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json"
                                },

                                credentials: "include",

                                body: JSON.stringify(atividadeId)
                            }
                        );

                    }


                    if (resposta.status === 401) {

                        alert("Você precisa estar logado para salvar uma atividade.");

                        return;
                    }


                    if (!resposta.ok) {

                        const mensagem = await resposta.text();

                        throw new Error(mensagem);

                    }


                    // Atualiza visualmente o coração

                    if (estaFavoritado) {

                        botaoFavorito.classList.remove("favoritado");

                        botaoFavorito.textContent = "favorite_border";

                    } else {

                        botaoFavorito.classList.add("favoritado");

                        botaoFavorito.textContent = "favorite";

                    }

                } catch (erro) {

                    console.error(
                        "Erro ao alterar favorito:",
                        erro
                    );

                    alert("Não foi possível alterar o favorito.");

                }

            });

        });


        configurarCarrosseis();


    } catch (erro) {

        console.error(
            "Erro ao carregar atividades:",
            erro
        );

    }

}



function configurarCarrosseis() {

    const categorias =
        document.querySelectorAll(".category-row");


    categorias.forEach(categoria => {

        const grid =
            categoria.querySelector(".catalog-grid");

        const botoes =
            categoria.querySelectorAll(".carousel-button");


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


document.addEventListener(
    "DOMContentLoaded",
    carregarAtividades
);