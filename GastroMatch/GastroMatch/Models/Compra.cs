
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace GastroMatch.Models
{
    [Table("compras")]
    public class Compra
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("fk_usuario_id")]
        public int Fk_Usuario_Id { get; set; }

        [Column("fk_atividade_id")]
        public int Fk_Atividade_Id { get; set; }

        [Column("valor_pago", TypeName = "decimal(18,2)")]
        public decimal Valor_Pago { get; set; }

        [Column("data_compra")]
        public DateTime Data_Compra { get; set; }

        [Column("status")]
        public int Status { get; set; }
    }
}
