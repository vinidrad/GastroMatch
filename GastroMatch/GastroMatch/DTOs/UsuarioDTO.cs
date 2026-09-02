namespace GastroMatch.DTOs
{
    public class CadastroUsuarioDTO
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Telefone { get; set; }
        public string Senha { get; set; }

        public bool Chef { get; set; }
        public bool Restaurante { get; set; }
        public bool Cliente { get; set; }
    }
}
