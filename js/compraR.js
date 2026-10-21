
const API_URL = "https://localhost:7218";

async function carregarReceita() {
    const titulo = document.getElementById("course-title");

    try {
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id");

        if (!id) {
            titulo.textContent = "Receita não encontrada.";
            return;
        }

        const resposta = await fetch(`${API_URL}/Atividades/${id}`);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar a receita.");
        }

        const receita = await resposta.json();

        console.log("Receita recebida:", receita);

        // Confirma que o ID pertence a uma receita
        if (Number(receita.tipo) !== 2) {
            titulo.textContent = "Esta atividade não é uma receita.";
            return;
        }

        document.title = "GastroMatch - Receita";

        // Nome
        titulo.textContent = receita.nome || "Receita";

        // Categoria
        document.getElementById("course-category").textContent =
            receita.categoria || "Receita";

        // Descrição
        document.getElementById("course-description").textContent =
            receita.sobre || receita.descricao || "Nenhuma descrição informada.";

        // Imagem
        const imagem = document.getElementById("course-image");
        imagem.src = receita.imagem || "";
        imagem.alt = receita.nome || "Imagem da receita";

        // Preço
        document.getElementById("course-price").textContent =
            Number(receita.valor || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        // Esconde aulas e duração, que são exclusivas dos cursos
        const aulas = document.getElementById("course-lessons");
        const duracao = document.getElementById("course-duration");

        if (aulas) aulas.parentElement.hidden = true;
        if (duracao) duracao.parentElement.hidden = true;

        // Esconde a seção de conteúdo do curso e o instrutor
        const conteudo = document.getElementById("course-content");
        if (conteudo) conteudo.hidden = true;

        const instrutor = document.getElementById("instructor-card");
        if (instrutor) instrutor.hidden = true;

        // Botão Obter: mantém o ID da receita no pagamento
        document.getElementById("buy-button").addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href =
                `pagamento.html?id=${encodeURIComponent(receita.id)}`;
        });

    } catch (erro) {
        console.error("Erro ao carregar receita:", erro);
        titulo.textContent = "Erro ao carregar a receita.";
    }
}

document.addEventListener("DOMContentLoaded", carregarReceita);
