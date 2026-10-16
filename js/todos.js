
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

let atividadesCarregadas = [];

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

async function carregarTodos() {
    const parametros = new URLSearchParams(window.location.search);

    const categoriaUrl = parametros.get("categoria");
    const tipoUrl = Number(parametros.get("tipo") || 1);

    const campoPesquisa = document.getElementById("campoPesquisa");
    const grade = document.getElementById("todos-cursos");
    const titulo = document.getElementById("titulo-catalogo")
        || document.querySelector(".catalog-heading h2");

    if (!grade) {
        console.error("Não foi encontrado o elemento #todos-cursos.");
        return;
    }

    // Define o tipo da página: 1 = cursos, 2 = receitas
    document.body.dataset.tipoAtividade =
        tipoUrl === 2 ? "2" : "1";

    if (titulo) {
        titulo.textContent = tipoUrl === 2
            ? "Todas as receitas"
            : "Todos os cursos";
    }

    if (campoPesquisa) {
        campoPesquisa.placeholder = tipoUrl === 2
            ? "Busque por uma receita"
            : "Busque por um curso";

        campoPesquisa.setAttribute(
            "aria-label",
            tipoUrl === 2 ? "Buscar receitas" : "Buscar cursos"
        );
    }

    try {
        const resposta = await fetch(`${API_URL}/Atividades`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as atividades.");
        }

        const atividades = await resposta.json();

        // Filtra pelo tipo e pela categoria enviada na URL
        atividadesCarregadas = atividades.filter(atividade => {
            const mesmoTipo = Number(atividade.tipo) ===
                (tipoUrl === 2 ? 2 : 1);

            const mesmaCategoria = !categoriaUrl ||
                normalizarTexto(atividade.categoria) ===
                normalizarTexto(categoriaUrl);

            return mesmoTipo && mesmaCategoria;
        });

        renderizarAtividades();
    } catch (erro) {
        console.error("Erro ao carregar atividades:", erro);
        grade.innerHTML = "<p>Não foi possível carregar as atividades.</p>";
    }

    campoPesquisa?.addEventListener("input", renderizarAtividades);
}

function renderizarAtividades() {
    const grade = document.getElementById("todos-cursos");
    const campoPesquisa = document.getElementById("campoPesquisa");
    const termo = normalizarTexto(campoPesquisa?.value || "");

    if (!grade) return;

    const filtradas = atividadesCarregadas.filter(atividade =>
        normalizarTexto(atividade.nome).includes(termo)
    );

    grade.innerHTML = "";

    if (filtradas.length === 0) {
        grade.innerHTML = "<p>Nenhuma atividade encontrada.</p>";
        return;
    }

    filtradas.forEach(atividade => {
        const categoriaId = categorias[atividade.categoria] || "";

        const card = document.createElement("article");
        card.className = "catalog-card";
        card.dataset.categoria = categoriaId;

        const link = document.createElement("a");
        link.href = `Compra.html?id=${atividade.id}`;

        const imagemContainer = document.createElement("div");
        imagemContainer.className = "catalog-image";

        const imagem = document.createElement("img");
        imagem.src = atividade.imagem || "";
        imagem.alt = atividade.nome || "Atividade";
        imagem.loading = "lazy";

        const favorito = document.createElement("span");
        favorito.className =
            "material-symbols-outlined botao-favorito";
        favorito.textContent = "favorite_border";
        favorito.dataset.id = atividade.id;
        favorito.setAttribute("role", "button");
        favorito.setAttribute("aria-label", "Salvar nos favoritos");

        imagemContainer.append(imagem, favorito);

        const nome = document.createElement("h3");
        nome.textContent = atividade.nome || "Sem título";

        link.append(imagemContainer, nome);
        card.appendChild(link);
        grade.appendChild(card);

        configurarFavorito(card);
    });

    carregarFavoritos();
}

function configurarFavorito(card) {
    const botao = card.querySelector(".botao-favorito");

    botao.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();

        const id = Number(botao.dataset.id);
        const estaSalvo = botao.classList.contains("favoritado");

        try {
            const resposta = await fetch(
                estaSalvo
                    ? `${API_URL}/Usuario/salvar/${id}`
                    : `${API_URL}/Usuario/salvar`,
                {
                    method: estaSalvo ? "DELETE" : "POST",
                    headers: estaSalvo
                        ? {}
                        : { "Content-Type": "application/json" },
                    credentials: "include",
                    ...(!estaSalvo && {
                        body: JSON.stringify(id)
                    })
                }
            );

            if (resposta.status === 401) {
                alert("Você precisa estar logado para salvar uma atividade.");
                return;
            }

            if (!resposta.ok) {
                throw new Error("Erro ao alterar favorito.");
            }

            botao.classList.toggle("favoritado");
            botao.textContent = botao.classList.contains("favoritado")
                ? "favorite"
                : "favorite_border";
        } catch (erro) {
            console.error(erro);
            alert("Não foi possível alterar o favorito.");
        }
    });
}

async function carregarFavoritos() {
    try {
        const resposta = await fetch(`${API_URL}/Usuario/salvos`, {
            credentials: "include"
        });

        if (!resposta.ok) return;

        const salvos = await resposta.json();

        document.querySelectorAll("#todos-cursos .botao-favorito")
            .forEach(botao => {
                const estaSalvo = salvos.some(item =>
                    Number(item.id) === Number(botao.dataset.id)
                );

                botao.classList.toggle("favoritado", estaSalvo);
                botao.textContent = estaSalvo
                    ? "favorite"
                    : "favorite_border";
            });
    } catch (erro) {
        console.log("Não foi possível carregar os favoritos.");
    }
}

document.addEventListener("DOMContentLoaded", carregarTodos);
