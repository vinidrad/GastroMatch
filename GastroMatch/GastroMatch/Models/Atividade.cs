namespace GastroMatch.Models
{
    public class Atividade
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public string Descricao { get; set; }

        public int Tipo { get; set; }

        public string Categoria { get; set; }

        public decimal Valor { get; set; }

        public int? Tempo_Curso { get; set; }

        public string Imagem { get; set; }

        public int Fk_Usuario_Id { get; set; }

        public DateTime Data_Cadastro { get; set; }


        // Relacionamento com usuário
        public Usuario Usuario { get; set; }


        // Relacionamento com aulas
        public ICollection<Aula> Aulas { get; set; }
    }
}
