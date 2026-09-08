
const chefs = [
    { name: "Andre", description: "Apaixonado por gastronomia e sempre em busca de novos sabores. Adoro experimentar receitas, aprender.", courses: ["Massas Artesanais", "Cozinha Italiana", "Molhos e Temperos"] },
    { name: "Camila", description: "Chef apaixonada por confeitaria, sabores afetivos e receitas que tornam cada momento mais especial.", courses: ["Doces de Vitrine", "Pães Caseiros", "Confeitaria Criativa"] },
    { name: "Rafael", description: "Exploro ingredientes brasileiros e técnicas simples para transformar a cozinha do dia a dia.", courses: ["Cozinha Brasileira", "Carnes e Grelhados", "Pratos Rápidos"] },
    { name: "Luiza", description: "Acredito em uma cozinha leve, colorida e cheia de possibilidades para compartilhar à mesa.", courses: ["Cozinha Vegetariana", "Saladas Especiais", "Sabores do Mundo"] }
];

const chefName = document.getElementById("chefName");
const chefDescription = document.getElementById("chefDescription");
const chefCourses = document.getElementById("chefCourses");
const prevChef = document.getElementById("prevChef");
const nextChef = document.getElementById("nextChef");
let currentChef = 0;

function renderChef() {
    const chef = chefs[currentChef];
    chefName.textContent = chef.name;
    chefDescription.textContent = chef.description;
    chefCourses.innerHTML = chef.courses.map((course) =>
        `<article class="course-card"><h3>${course}</h3></article>`
    ).join("");
}

function changeChef(direction) {
    currentChef = (currentChef + direction + chefs.length) % chefs.length;
    renderChef();
}

prevChef.addEventListener("click", () => changeChef(-1));
nextChef.addEventListener("click", () => changeChef(1));
renderChef();
