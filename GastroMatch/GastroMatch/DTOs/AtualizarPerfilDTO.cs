using Microsoft.AspNetCore.Http;

namespace GastroMatch.DTOs
{
    public class AtualizarPerfilDTO
    {
        public string Nome { get; set; } = "";
        public string Telefone { get; set; } = "";
        public string? Bio { get; set; } 
        public IFormFile? Foto { get; set; }
    }
}