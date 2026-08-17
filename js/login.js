
const form = document.getElementById('form');
const senha = document.getElementById('senha');
const email = document.getElementById('email');


form.addEventListener('submit', (e) =>{
    e.preventDefault();

    const valido =0

        validarEmail() &&
        validarSenha() 
       

    if (valido) {
           fetch("https://localhost:7132/", {
        method: "POST",
        credentials:"include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email:document.getElementById("email"),
            senha:document.getElementById("senha")
        })
    })
    
    .then(data => {
        console.log("Sucesso:", data);
        window.location.href='index.html'
       
       
    })
    .catch(error => {
        console.error("Erro:", error);
        alert
    });

    }
});