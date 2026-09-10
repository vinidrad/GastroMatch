using Microsoft.AspNetCore.Http;

namespace GastroMatch.DTOs
{
    public class AtividadeCadastroDTO
    {
        public string Nome { get; set; }

        public string Descricao { get; set; }

        public int Tipo { get; set; }

        public string Categoria { get; set; }

        public decimal Valor { get; set; }

        public int? Tempo_Curso { get; set; }

        public IFormFile Imagem { get; set; }

        public int Fk_Usuario_Id { get; set; }

        public List<AulaCadastroDTO> Aulas { get; set; } = new List<AulaCadastroDTO>();
    }

    public class AulaCadastroDTO
    {
        public string Titulo { get; set; }

        public int Ordem { get; set; }

        public IFormFile Video { get; set; }
    }
}