namespace GastroMatch.Models
{
    public class Salvo
    {
        public int Id { get; set; }

        public int Fk_Usuario_Id { get; set; }

        public int Fk_Atividade_Id { get; set; }

        public DateTime Data_Salvo { get; set; }
    }
}