const API_URL = "https://localhost:7132";


// ========================================
// ELEMENTOS
// ========================================

const form = document.getElementById("formAtividade");

const nome = document.getElementById("nome");
const categoria = document.getElementById("categoria");
const tempoCurso = document.getElementById("tempoCurso");
const tipo = document.getElementById("tipo");
const valor = document.getElementById("valor");
const descricao = document.getElementById("descricao");

const campoSobre = document.getElementById("campoSobre");
const btnAddSobre = document.getElementById("btnAddSobre");
const listaSobre = document.getElementById("listaSobre");

const imagemCapa = document.getElementById("imagemCapa");
const capaPreview = document.getElementById("capaPreview");
const textoCapa = document.getElementById("textoCapa");

const btnAdicionarAula =
    document.getElementById("btnAdicionarAula");

const listaAulas =
    document.getElementById("listaAulas");

const semAulas =
    document.getElementById("semAulas");

const mensagem =
    document.getElementById("mensagem");

const btnCriar =
    document.getElementById("btnCriar");


// ========================================
// ARRAYS
// ========================================

let itensSobre = [];

let aulas = [];


// ========================================
// PREVIEW DO NOME
// ========================================

nome.addEventListener("input", function () {

    document.getElementById("previewNome").textContent =
        nome.value.trim() || "Nome";

});


// ========================================
// PREVIEW CATEGORIA
// ========================================

categoria.addEventListener("change", function () {

    document.getElementById("previewCategoria").textContent =
        categoria.value || "Categoria";

});


// ========================================
// PREVIEW VALOR
// ========================================

valor.addEventListener("input", function () {

    if (valor.value === "") {

        document.getElementById("previewValor")
            .textContent = "Valor";

        return;
    }


    const valorFormatado =
        Number(valor.value).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );


    document.getElementById("previewValor")
        .textContent = valorFormatado;

});


// ========================================
// PREVIEW DURAÇÃO
// ========================================

tempoCurso.addEventListener("input", function () {

    if (tempoCurso.value === "") {

        document.getElementById("previewDuracao")
            .textContent = "Duração";

        return;
    }


    document.getElementById("previewDuracao")
        .textContent =
        tempoCurso.value + " min";

});


// ========================================
// TIPO
// ========================================

tipo.addEventListener("change", function () {

    /*
        Curso = 1
        Receita = 2
    */

    if (tipo.value === "2") {

        tempoCurso.value = "";

        tempoCurso.disabled = true;

        tempoCurso.placeholder = "Não se aplica";

        document.getElementById("previewDuracao")
            .textContent = "Duração";

    } else {

        tempoCurso.disabled = false;

        tempoCurso.placeholder = "Min";

    }


    // Área de vídeos

    const areaVideos =
        document.getElementById("areaVideos");


    if (tipo.value === "2") {

        areaVideos.style.display = "none";

    } else {

        areaVideos.style.display = "block";

    }

});


// ========================================
// CAPA
// ========================================

imagemCapa.addEventListener("change", function () {

    const arquivo = imagemCapa.files[0];


    if (!arquivo) {

        capaPreview.style.backgroundImage = "none";

        textoCapa.style.display = "block";

        return;

    }


    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!tiposPermitidos.includes(arquivo.type)) {

        mostrarErro(
            "A capa deve ser JPG, PNG ou WEBP."
        );

        imagemCapa.value = "";

        return;

    }


    const tamanhoMaximo =
        5 * 1024 * 1024;


    if (arquivo.size > tamanhoMaximo) {

        mostrarErro(
            "A capa pode ter no máximo 5 MB."
        );

        imagemCapa.value = "";

        return;

    }


    const leitor = new FileReader();


    leitor.onload = function (event) {

        capaPreview.style.backgroundImage =
            `url("${event.target.result}")`;

        textoCapa.style.display = "none";

    };


    leitor.readAsDataURL(arquivo);

});


// ========================================
// SOBRE
// ========================================

btnAddSobre.addEventListener(
    "click",
    adicionarSobre
);


campoSobre.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            adicionarSobre();

        }

    }
);


function adicionarSobre() {

    limparMensagem();


    const texto =
        campoSobre.value.trim();


    if (texto === "") {

        mostrarErro(
            "Digite uma informação no campo Sobre."
        );

        campoSobre.focus();

        return;

    }


    if (itensSobre.includes(texto)) {

        mostrarErro(
            "Esse item já foi adicionado."
        );

        return;

    }


    itensSobre.push(texto);

    campoSobre.value = "";

    renderizarSobre();

}


function renderizarSobre() {

    listaSobre.innerHTML = "";


    itensSobre.forEach(
        function (item, index) {

            const tag =
                document.createElement("div");

            tag.className =
                "tag-sobre";


            const texto =
                document.createElement("span");

            texto.textContent =
                item;


            const botao =
                document.createElement("button");

            botao.type = "button";

            botao.textContent = "×";


            botao.addEventListener(
                "click",
                function () {

                    itensSobre.splice(
                        index,
                        1
                    );

                    renderizarSobre();

                }
            );


            tag.appendChild(texto);

            tag.appendChild(botao);

            listaSobre.appendChild(tag);

        }
    );

}


// ========================================
// ADICIONAR AULA
// ========================================

btnAdicionarAula.addEventListener(
    "click",
    adicionarAula
);


function adicionarAula() {

    limparMensagem();


    const id =
        Date.now();


    const novaAula = {

        id: id,

        titulo: "",

        video: null

    };


    aulas.push(novaAula);


    renderizarAulas();

}


// ========================================
// RENDERIZAR AULAS
// ========================================

function renderizarAulas() {

    listaAulas.innerHTML = "";


    if (aulas.length === 0) {

        listaAulas.appendChild(semAulas);

        return;

    }


    aulas.forEach(
        function (aula, index) {

            const card =
                document.createElement("div");

            card.className = "aula";


            // ==============================
            // NÚMERO
            // ==============================

            const numero =
                document.createElement("div");

            numero.className =
                "numero-aula";

            numero.textContent =
                index + 1;


            // ==============================
            // TÍTULO
            // ==============================

            const info =
                document.createElement("div");

            info.className =
                "aula-info";


            const labelTitulo =
                document.createElement("label");

            labelTitulo.textContent =
                "Título da aula";


            const inputTitulo =
                document.createElement("input");

            inputTitulo.type = "text";

            inputTitulo.placeholder =
                "Ex: Introdução à receita";

            inputTitulo.maxLength = 200;

            inputTitulo.value =
                aula.titulo;


            inputTitulo.addEventListener(
                "input",
                function () {

                    aula.titulo =
                        inputTitulo.value;

                }
            );


            info.appendChild(
                labelTitulo
            );

            info.appendChild(
                inputTitulo
            );


            // ==============================
            // VÍDEO
            // ==============================

            const video =
                document.createElement("div");

            video.className =
                "aula-video";


            const labelVideo =
                document.createElement("label");

            labelVideo.textContent =
                "Vídeo da aula";


            const inputVideo =
                document.createElement("input");

            inputVideo.type = "file";

            inputVideo.className =
                "input-video";

            inputVideo.accept =
                "video/mp4,video/webm,video/quicktime";


            inputVideo.addEventListener(
                "change",
                function () {

                    const arquivo =
                        inputVideo.files[0];


                    if (!arquivo)
                        return;


                    const tiposPermitidos = [
                        "video/mp4",
                        "video/webm",
                        "video/quicktime"
                    ];


                    if (
                        !tiposPermitidos
                            .includes(arquivo.type)
                    ) {

                        mostrarErro(
                            "O vídeo deve ser MP4, WEBM ou MOV."
                        );

                        inputVideo.value = "";

                        aula.video = null;

                        return;

                    }


                    /*
                        Limite de exemplo:
                        500 MB
                    */

                    const tamanhoMaximo =
                        500 * 1024 * 1024;


                    if (
                        arquivo.size >
                        tamanhoMaximo
                    ) {

                        mostrarErro(
                            "O vídeo pode ter no máximo 500 MB."
                        );

                        inputVideo.value = "";

                        aula.video = null;

                        return;

                    }


                    aula.video = arquivo;

                }
            );


            video.appendChild(
                labelVideo
            );

            video.appendChild(
                inputVideo
            );


            // ==============================
            // REMOVER
            // ==============================

            const remover =
                document.createElement("button");

            remover.type = "button";

            remover.className =
                "btn-remover-aula";

            remover.textContent = "×";

            remover.title =
                "Remover aula";


            remover.addEventListener(
                "click",
                function () {

                    aulas =
                        aulas.filter(
                            function (item) {

                                return item.id !== aula.id;

                            }
                        );


                    renderizarAulas();

                }
            );


            // ==============================
            // MONTAR CARD
            // ==============================

            card.appendChild(numero);

            card.appendChild(info);

            card.appendChild(video);

            card.appendChild(remover);


            listaAulas.appendChild(card);

        }
    );

}


// ========================================
// SUBMIT
// ========================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        limparMensagem();


        // ==============================
        // VALIDAR
        // ==============================

        const erro =
            validarFormulario();


        if (erro) {

            mostrarErro(erro);

            return;

        }


        // ==============================
        // USUÁRIO
        // ==============================

        const idUsuario =
            localStorage.getItem(
                "idUsuario"
            );


        if (!idUsuario) {

            mostrarErro(
                "Usuário não identificado. Faça login novamente."
            );

            return;

        }


        // ==============================
        // FORM DATA
        // ==============================

        const formData =
            new FormData();


        formData.append(
            "Nome",
            nome.value.trim()
        );


        formData.append(
            "Descricao",
            descricao.value.trim()
        );


        formData.append(
            "Tipo",
            tipo.value
        );


        formData.append(
            "Categoria",
            categoria.value
        );


        formData.append(
            "Valor",
            valor.value
        );


        if (
            tipo.value === "1"
        ) {

            formData.append(
                "Tempo_Curso",
                tempoCurso.value
            );

        }


        formData.append(
            "Fk_Usuario_Id",
            idUsuario
        );


        // ==============================
        // CAPA
        // ==============================

        if (
            imagemCapa.files.length > 0
        ) {

            formData.append(
                "Imagem",
                imagemCapa.files[0]
            );

        }


        // ==============================
        // SOBRE
        // ==============================

        itensSobre.forEach(
            function (item) {

                formData.append(
                    "Sobre",
                    item
                );

            }
        );


        // ==============================
        // AULAS
        // ==============================

        aulas.forEach(
            function (aula, index) {

                formData.append(
                    `Aulas[${index}].Titulo`,
                    aula.titulo
                );


                formData.append(
                    `Aulas[${index}].Ordem`,
                    index + 1
                );


                if (aula.video) {

                    formData.append(
                        `Aulas[${index}].Video`,
                        aula.video
                    );

                }

            }
        );


        // ==============================
        // ENVIAR
        // ==============================

        btnCriar.disabled = true;

        btnCriar.textContent =
            "...";


        try {

            const resposta =
                await fetch(
                    `${API_URL}/Atividades/cadastrar`,
                    {
                        method: "POST",

                        credentials: "include",

                        body: formData
                    }
                );


            const dados =
                await resposta
                    .json()
                    .catch(() => null);


            if (!resposta.ok) {

                throw new Error(
                    dados?.mensagem ||
                    dados?.message ||
                    "Não foi possível cadastrar a atividade."
                );

            }


            mostrarSucesso(
                "Atividade cadastrada com sucesso!"
            );


            form.reset();

            itensSobre = [];

            aulas = [];

            renderizarSobre();

            renderizarAulas();


            capaPreview.style.backgroundImage =
                "none";

            textoCapa.style.display =
                "block";


            document.getElementById(
                "previewNome"
            ).textContent = "Nome";


            document.getElementById(
                "previewDuracao"
            ).textContent = "Duração";


            document.getElementById(
                "previewValor"
            ).textContent = "Valor";


            document.getElementById(
                "previewCategoria"
            ).textContent = "Categoria";


        } catch (erro) {

            console.error(erro);

            mostrarErro(
                erro.message ||
                "Erro ao conectar com o servidor."
            );

        } finally {

            btnCriar.disabled = false;

            btnCriar.textContent =
                "Criar";

        }

    }
);


// ========================================
// VALIDAÇÃO
// ========================================

function validarFormulario() {


    if (
        nome.value.trim() === ""
    ) {

        nome.focus();

        return "Preencha o nome.";

    }


    if (
        nome.value.trim().length < 3
    ) {

        nome.focus();

        return "O nome deve ter pelo menos 3 caracteres.";

    }


    if (
        categoria.value === ""
    ) {

        categoria.focus();

        return "Selecione uma categoria.";

    }


    if (
        tipo.value === ""
    ) {

        tipo.focus();

        return "Selecione o tipo.";

    }


    if (
        valor.value === ""
    ) {

        valor.focus();

        return "Informe o valor.";

    }


    if (
        Number(valor.value) < 0
    ) {

        valor.focus();

        return "O valor não pode ser negativo.";

    }


    if (
        descricao.value.trim() === ""
    ) {

        descricao.focus();

        return "Preencha a descrição.";

    }


    // Curso

    if (
        tipo.value === "1"
    ) {

        if (
            tempoCurso.value === "" ||
            Number(tempoCurso.value) <= 0
        ) {

            tempoCurso.focus();

            return "Informe a duração do curso.";

        }


        /*
            Curso precisa ter pelo menos
            uma aula.
        */

        if (
            aulas.length === 0
        ) {

            return "Adicione pelo menos uma aula ao curso.";

        }


        /*
            Verificar título e vídeo
        */

        for (
            let i = 0;
            i < aulas.length;
            i++
        ) {

            if (
                aulas[i].titulo.trim() === ""
            ) {

                return `Informe o título da aula ${i + 1}.`;

            }


            if (!aulas[i].video) {

                return `Selecione o vídeo da aula ${i + 1}.`;

            }

        }

    }


    return null;

}


// ========================================
// MENSAGENS
// ========================================

function mostrarErro(texto) {

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem erro";

    mensagem.style.display =
        "block";

}


function mostrarSucesso(texto) {

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem sucesso";

    mensagem.style.display =
        "block";

}


function limparMensagem() {

    mensagem.textContent = "";

    mensagem.style.display =
        "none";

}