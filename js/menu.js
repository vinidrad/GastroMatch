function renderMenu(seletor) {
  const destino = document.querySelector(seletor);

  destino.innerHTML = `
     <nav class="menu">
        <a href="index.html" class="menu-logo">
            <img src="../img/logo.png" alt="" class="menu-logo-img">
            <span>GastroMatch</span>
        </a>

        <a href="aulas.html" class="menu-link">Aulas</a>
        <a href="receitas.html" class="menu-link">Receitas</a>
        
        <a href="comunidade.html" class="menu-link">Comunidade</a>

        <a href="pesquisar.html" class="botao-icone" aria-label="Buscar">
            <span class="material-symbols-outlined">search</span>
        </a>
        <a href="perfil.html" class="botao-icone" aria-label="Perfil">
            <span class="material-symbols-outlined">account_circle</span>
        </a>
    </nav>
  `;
}







