
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GastroMatch.Models
{
    [Table("respostas")]
    public class Resposta
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("fk_pergunta_id")]
        public int Fk_Pergunta_Id { get; set; }

        [Required]
        [Column("fk_usuario_id")]
        public int Fk_Usuario_Id { get; set; }

       [Required]
[Column("resposta")]
public string TextoResposta { get; set; } = string.Empty;

        [Column("data")]
        public DateTime Data { get; set; }
    }
}
