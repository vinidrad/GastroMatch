
const API_URL = "https://localhost:7218";

async function carregarCurso() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id");

        if (!id) {
            document.getElementById("course-title").textContent =
                "Curso não encontrado.";
            return;
        }

        const resposta = await fetch(`${API_URL}/Atividades/${id}`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar o curso.");
        }

        const curso = await resposta.json();

        console.log("Curso recebido:", curso);

        // INSTRUTOR — somente nome, sem foto
        document.getElementById("instructor-name").textContent =
            curso.criador?.trim() || "Instrutor não informado";

        // NOME DO CURSO
        document.getElementById("course-title").textContent =
            curso.nome;

        // DESCRIÇÃO
        document.getElementById("course-description").textContent =
            curso.descricao || "Nenhuma descrição informada.";

        // CATEGORIA
        document.getElementById("course-category").textContent =
            curso.categoria || "Sem categoria";

        // CAPA DO CURSO — independente da foto do instrutor
        const imagem = document.getElementById("course-image");

        imagem.src = curso.imagem || "";
        imagem.alt = curso.nome || "Imagem do curso";

        imagem.onerror = function () {
            console.error("Não foi possível carregar a capa:", this.src);
        };

        // PREÇO
        const valor = Number(curso.valor);

        document.getElementById("course-price").textContent =
            valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        // AULAS
        const aulas = curso.aulas || [];

        document.getElementById("course-lessons").textContent =
            `${aulas.length} ${aulas.length === 1 ? "aula" : "aulas"}`;

        // DURAÇÃO
        if (curso.tempo_Curso != null && curso.tempo_Curso !== "") {
            const minutos = Number(curso.tempo_Curso);
            const horas = Math.floor(minutos / 60);
            const minutosRestantes = minutos % 60;

            let duracao = "";

            if (horas > 0) {
                duracao += `${horas}h`;
            }

            if (minutosRestantes > 0) {
                if (duracao !== "") duracao += " ";
                duracao += `${minutosRestantes}min`;
            }

            document.getElementById("course-duration").textContent =
                duracao || "0min";
        } else {
            document.getElementById("course-duration").textContent =
                "Não informado";
        }

        // LISTA "O QUE VAMOS APRENDER"
        const lista = document.getElementById("course-lessons-list");

        lista.innerHTML = "";

        if (aulas.length === 0) {
            const item = document.createElement("li");
            item.textContent =
                "O conteúdo deste curso será disponibilizado em breve.";
            lista.appendChild(item);
        } else {
            aulas.forEach(aula => {
                const item = document.createElement("li");
                item.textContent = aula.titulo || "Aula sem título";
                lista.appendChild(item);
            });
        }

        // BOTÃO OBTER
        document.getElementById("buy-button").onclick = function (event) {
            event.preventDefault();
            window.location.href = `pagamento.html?id=${curso.id}`;
        };

    } catch (erro) {
        console.error("Erro ao carregar curso:", erro);

        document.getElementById("course-title").textContent =
            "Erro ao carregar o curso.";
    }
}

document.addEventListener("DOMContentLoaded", carregarCurso);
