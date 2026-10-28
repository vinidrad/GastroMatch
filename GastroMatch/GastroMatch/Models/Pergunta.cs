
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GastroMatch.Models
{
    [Table("perguntas")]
    public class Pergunta
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("fk_usuario_id")]
        public int Fk_Usuario_Id { get; set; }

        [Required]
        [Column("assunto")]
        public string Assunto { get; set; } = string.Empty;

        [Required]
        [Column("pergunta")]
        public string TextoPergunta { get; set; } = string.Empty;

        [Column("data")]
        public DateTime Data { get; set; }
    }
}
