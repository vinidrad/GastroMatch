using GastroMatch.Models;
using Microsoft.EntityFrameworkCore;

namespace GastroMatch.Data
{
    public class GastroContext : DbContext
    {
        public GastroContext(DbContextOptions<GastroContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Resposta> Respostas { get; set; }
        public DbSet<Pergunta> Perguntas { get; set; }
        public DbSet<Compra> Compras { get; set; } 
        public DbSet<Avaliacao> Avaliacaos { get; set; }
        public DbSet<Atividade> Atividades { get; set; }



       
       
    }
}
