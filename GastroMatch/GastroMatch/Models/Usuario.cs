namespace GastroMatch.Models
{
    public class Usuario
    {
        private bool v1;
        private int v2;

        public Usuario(int id, string email, string telefone, string senha, bool chef, bool restaurante, bool cliente, bool v1, int v2)
        {
            Id = id;
            Email = email;
            Telefone = telefone;
            Senha = senha;
            Chef = chef;
            Restaurante = restaurante;
            Cliente = cliente;
            this.v1 = v1;
            this.v2 = v2;
        }

        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Telefone { get; set; }
        public string Senha { get; set; }
        public string Cnpj {  get; set; }
        public bool Certificado { get; set; }
        public bool Chef {  get; set; }
        public bool Restaurante { get; set; }
        public bool Cliente { get; set; }










        
    }
}
