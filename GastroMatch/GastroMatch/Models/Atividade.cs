using System.ComponentModel.DataAnnotations.Schema;

namespace GastroMatch.Models
{
    public class Atividade
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public string Descricao { get; set; }
        public string? Sobre { get; set; }

        public int Tipo { get; set; }

        public string Categoria { get; set; }

        public decimal Valor { get; set; }

        public int? Tempo_Curso { get; set; }

        public string Imagem { get; set; }

        public int Fk_Usuario_Id { get; set; }

        public DateTime Data_Cadastro { get; set; }

        [ForeignKey(nameof(Fk_Usuario_Id))]
        public Usuario Usuario { get; set; }

        public ICollection<Aula> Aulas { get; set; } = new List<Aula>();
    }
}