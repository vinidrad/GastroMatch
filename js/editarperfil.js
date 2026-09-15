
const API_URL = "https://localhost:7218";

document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // ELEMENTOS
    // =========================

    const btnSalvar = document.getElementById("btnSalvar");

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");
    const tipoUsuario = document.getElementById("tipoUsuario");
    const descricao = document.getElementById("descricao");

    const fotoGrande = document.getElementById("fotoGrande");
    const inputFoto = document.getElementById("inputFoto");

    const arquivo = document.getElementById("arquivo");
    const labelDocumento = document.getElementById("labelDocumento");
    const statusDocumento = document.getElementById("statusDocumento");

    const nomeUsuario = document.getElementById("nomeUsuario");
    const descricaoUsuario = document.getElementById("descricaoUsuario");


    // =========================
    // CARREGAR PERFIL
    // =========================

    fetch(`${API_URL}/Usuario/perfil`, {
        method: "GET",
        credentials: "include"
    })
        .then(response => {

            if (!response.ok) {
                throw new Error("Erro ao carregar perfil.");
            }

            return response.json();
        })

        .then(usuario => {

            console.log("USUÁRIO RECEBIDO:", usuario);


            // =========================
            // LADO ESQUERDO
            // =========================

            nomeUsuario.textContent =
                usuario.nome || "Usuário";

            descricaoUsuario.textContent =
                usuario.bio ||
                "Bem-vindo ao GastroMatch! Fale mais sobre você.";


            // =========================
            // CAMPOS
            // =========================

            nome.value =
                usuario.nome || "";

            email.value =
                usuario.email || "";

            telefone.value =
                usuario.telefone || "";

            descricao.value =
                usuario.bio || "";


            // =========================
            // TIPO DE USUÁRIO
            // =========================

            if (usuario.chef === true) {

                tipoUsuario.value = "Chef";

            }
            else if (usuario.restaurante === true) {

                tipoUsuario.value = "Restaurante";

            }
            else if (usuario.cliente === true) {

                tipoUsuario.value = "Cliente";

            }


            // =========================
            // FOTO ATUAL
            // =========================

            if (usuario.foto_perfil) {

                fotoGrande.style.backgroundImage =
                    `url(${API_URL}${usuario.foto_perfil})`;

                fotoGrande.style.backgroundSize = "cover";
                fotoGrande.style.backgroundPosition = "center";
                fotoGrande.style.backgroundRepeat = "no-repeat";
            }


            // =========================
            // DOCUMENTO
            // =========================

            if (usuario.chef === true) {

                labelDocumento.textContent =
                    "Envie o certificado";

                if (usuario.certificado) {

                    statusDocumento.textContent =
                        "Documento enviado";

                }
                else {

                    statusDocumento.textContent =
                        "Não enviado";

                }

            }

            else if (usuario.restaurante === true) {

                labelDocumento.textContent =
                    "Envie o CNPJ";

                if (usuario.cnpj) {

                    statusDocumento.textContent =
                        "Documento enviado";

                }
                else {

                    statusDocumento.textContent =
                        "Não enviado";

                }

            }

            else {

                labelDocumento.textContent =
                    "Documento";

                statusDocumento.textContent =
                    "Não é necessário";

                arquivo.disabled = true;

            }

        })

        .catch(error => {

            console.error(error);

            alert("Não foi possível carregar os dados do perfil.");

        });



    // =========================
    // ESCOLHER FOTO
    // =========================

    fotoGrande.addEventListener("click", function () {

        inputFoto.click();

    });


    inputFoto.addEventListener("change", function () {

        if (inputFoto.files.length > 0) {

            const foto = inputFoto.files[0];

            const urlFoto = URL.createObjectURL(foto);

            fotoGrande.style.backgroundImage =
                `url(${urlFoto})`;

            fotoGrande.style.backgroundSize = "cover";
            fotoGrande.style.backgroundPosition = "center";
            fotoGrande.style.backgroundRepeat = "no-repeat";

        }

    });



    // =========================
    // ESCOLHER DOCUMENTO
    // =========================

    arquivo.addEventListener("change", function () {

        if (arquivo.files.length > 0) {

            const arquivoSelecionado = arquivo.files[0];

            labelDocumento.textContent =
                arquivoSelecionado.name;

            statusDocumento.textContent =
                "Arquivo selecionado";

        }
        else {

            statusDocumento.textContent =
                "Não enviado";

        }

    });



    // =========================
    // SALVAR PERFIL
    // =========================

    btnSalvar.addEventListener("click", async function () {

        btnSalvar.disabled = true;

        btnSalvar.textContent = "Salvando...";


        try {

            // =========================
            // DADOS DO PERFIL
            // =========================

            const dados = new FormData();

            dados.append("Nome", nome.value || "");
            dados.append("Telefone", telefone.value || "");
            dados.append("Bio", descricao.value || "");


            // =========================
            // FOTO
            // =========================

            if (inputFoto.files.length > 0) {

                dados.append(
                    "Foto",
                    inputFoto.files[0]
                );

            }


            // =========================
            // ATUALIZAR PERFIL
            // =========================

            const respostaPerfil = await fetch(
                `${API_URL}/Usuario/atualizar`,
                {
                    method: "PUT",
                    credentials: "include",
                    body: dados
                }
            );


            if (!respostaPerfil.ok) {

                const erro = await respostaPerfil.text();

                console.error(
                    "ERRO AO ATUALIZAR PERFIL:",
                    erro
                );

                throw new Error(
                    "Erro ao atualizar o perfil."
                );

            }


            // =========================
            // ENVIAR DOCUMENTO
            // =========================

            if (
                arquivo.files.length > 0 &&
                !arquivo.disabled
            ) {

                const dadosArquivo = new FormData();

                dadosArquivo.append(
                    "arquivo",
                    arquivo.files[0]
                );


                const respostaArquivo = await fetch(
                    `${API_URL}/Usuario/enviar-arquivo`,
                    {
                        method: "POST",
                        credentials: "include",
                        body: dadosArquivo
                    }
                );


                if (!respostaArquivo.ok) {

                    const erroArquivo =
                        await respostaArquivo.text();

                    console.error(
                        "ERRO AO ENVIAR DOCUMENTO:",
                        erroArquivo
                    );

                    throw new Error(
                        "Perfil salvo, mas houve um erro ao enviar o documento."
                    );

                }

            }


            // =========================
            // SUCESSO
            // =========================

            alert("Perfil atualizado com sucesso!");

            // Atualiza os dados mostrados no lado esquerdo

            nomeUsuario.textContent =
                nome.value || "Usuário";

            descricaoUsuario.textContent =
                descricao.value ||
                "Bem-vindo ao GastroMatch! Fale mais sobre você.";


            // Se tiver foto nova, mantém a visualização

            if (inputFoto.files.length > 0) {

                const novaFoto =
                    URL.createObjectURL(inputFoto.files[0]);

                fotoGrande.style.backgroundImage =
                    `url(${novaFoto})`;

            }


            // Atualiza o status do documento

            if (arquivo.files.length > 0) {

                statusDocumento.textContent =
                    "Documento enviado";

            }


        }

        catch (erro) {

            console.error(erro);

            alert(erro.message);

        }

        finally {

            btnSalvar.disabled = false;

            btnSalvar.textContent = "Salvar";

        }

    });


    // =========================
    // SAIR
    // =========================

    const btnSair = document.getElementById("btnSair");

    if (btnSair) {

        btnSair.addEventListener("click", function (event) {

            event.preventDefault();

            fetch(`${API_URL}/Usuario/logout`, {
                method: "POST",
                credentials: "include"
            })
                .then(() => {

                    window.location.href = "login.html";

                })
                .catch(error => {

                    console.error(error);

                    window.location.href = "login.html";

                });

        });

    }

});

