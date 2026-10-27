
const API_URL = "https://localhost:7218";

const campoPesquisa = document.getElementById("campoPesquisa");
const resultados = document.getElementById("resultados");
const tituloResultados = document.getElementById("tituloResultados");

let todasAtividades = [];

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Carrega todos os cursos e receitas
async function carregarAtividades() {
    resultados.innerHTML =
        '<p class="sem-resultados">Carregando conteúdos...</p>';

    try {
        const resposta = await fetch(`${API_URL}/Atividades`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as atividades.");
        }

        todasAtividades = await resposta.json();

        // Exibe todos os itens ao abrir a página
        exibirAtividades(todasAtividades);

    } catch (erro) {
        console.error("Erro ao carregar atividades:", erro);

        resultados.innerHTML = `
            <p class="sem-resultados">
                Não foi possível carregar os conteúdos.
                Verifique se a API está funcionando.
            </p>
        `;
    }
}

// Cria os cards dos resultados
function exibirAtividades(atividades) {
    resultados.innerHTML = "";

    if (!atividades.length) {
        resultados.innerHTML = `
            <p class="sem-resultados">
                Nenhum conteúdo encontrado.
                Tente pesquisar por outro nome.
            </p>
        `;
        return;
    }

    atividades.forEach(atividade => {
        const card = document.createElement("article");
        card.className = "card-resultado";

        const imagem = document.createElement("div");
        imagem.className = "card-imagem";

        if (atividade.imagem) {
            const img = document.createElement("img");
            img.src = atividade.imagem;
            img.alt = atividade.nome || "Conteúdo gastronômico";
            img.loading = "lazy";

            img.onerror = () => {
                img.style.display = "none";
            };

            imagem.appendChild(img);
        }

        const nome = document.createElement("p");
        nome.className = "card-nome";
        nome.textContent = atividade.nome || "Sem título";

        const categoria = document.createElement("p");
        categoria.className = "card-categoria";
        categoria.textContent =
            atividade.categoria || "Gastronomia";

        card.appendChild(imagem);
        card.appendChild(nome);
        card.appendChild(categoria);

        // Ao clicar, abre o conteúdo selecionado
        card.addEventListener("click", () => {
            window.location.href =
                `../html/detalhes.html?id=${atividade.id}`;
        });

        resultados.appendChild(card);
    });
}

// Pesquisa enquanto a pessoa digita
campoPesquisa.addEventListener("input", () => {
    const termo = normalizar(campoPesquisa.value);

    const filtradas = todasAtividades.filter(atividade => {
        const nome = normalizar(atividade.nome);
        const categoria = normalizar(atividade.categoria);
        const descricao = normalizar(atividade.descricao);
        const sobre = normalizar(atividade.sobre);

        return (
            nome.includes(termo) ||
            categoria.includes(termo) ||
            descricao.includes(termo) ||
            sobre.includes(termo)
        );
    });

    tituloResultados.textContent = termo
        ? "Resultados da pesquisa"
        : "Indicações da casa.";

    exibirAtividades(filtradas);
});

// Inicia a página
carregarAtividades();
