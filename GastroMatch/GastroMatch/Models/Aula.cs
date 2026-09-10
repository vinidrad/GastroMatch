namespace GastroMatch.Models
{
    public class Aula
    {
        public int Id { get; set; }

        public int Fk_Atividade_Id { get; set; }

        public string Titulo { get; set; }

        public string Video { get; set; }

        public int Ordem { get; set; }

        public DateTime Data_Cadastro { get; set; }


        // Relacionamento com atividade
        public Atividade Atividade { get; set; }
    }
}
