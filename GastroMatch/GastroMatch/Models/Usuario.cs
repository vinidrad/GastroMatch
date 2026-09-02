namespace GastroMatch.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        public string Nome { get; set; }
        public string Email { get; set; }
        public string Telefone { get; set; }
        public string Senha { get; set; }

        public string? Cnpj { get; set; }
        public string StatusCnpj { get; set; }

        public string? Certificado { get; set; }
        public string StatusCertificado { get; set; }

        public bool Chef { get; set; }
        public bool Restaurante { get; set; }
        public bool Cliente { get; set; }
    }
}
