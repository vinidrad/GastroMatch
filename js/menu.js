function renderMenu(seletor) {
  const destino = document.querySelector(seletor);

  destino.innerHTML = `
     <nav class="menu">
        <a href="index.html" class="menu-logo">GastroMatch</a>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-links" aria-label="Abrir menu">
            <span class="material-symbols-outlined">menu</span>
        </button>

        <div class="menu-links" id="menu-links">
            <a href="receitas.html" class="menu-link">Receitas</a>
            <a href="indicacoes.html" class="menu-link">Indicações</a>
            <a href="aulas.html" class="menu-link">Aulas</a>
            <a href="comunidade.html" class="menu-link">Comunidade</a>

            <a href="buscar.html" class="botao-icone" aria-label="Buscar">
                <span class="material-symbols-outlined">search</span>
            </a>
            <a href="login.html" class="botao-icone" aria-label="Perfil">
                <span class="material-symbols-outlined">account_circle</span>
            </a>
        </div>
    </nav>
  `;

  const botaoMenu = destino.querySelector(".menu-toggle");
  const menu = destino.querySelector(".menu");

  botaoMenu.addEventListener("click", () => {
    const aberto = menu.classList.toggle("menu-aberto");
    botaoMenu.setAttribute("aria-expanded", aberto);
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    botaoMenu.querySelector("span").textContent = aberto ? "close" : "menu";
  });
}
