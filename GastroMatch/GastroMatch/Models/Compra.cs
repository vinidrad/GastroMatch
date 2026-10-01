using System;

namespace GastroMatch.Models
{
    public class Compra
    {
        public int Id { get; set; }

        public int Fk_Usuario_Id { get; set; }

        public int Fk_Atividade_Id { get; set; }

        public decimal Valor_Pago { get; set; }

        public DateTime Data_Compra { get; set; }

        public int Status { get; set; }
    }
}