
using GastroMatch.Data;
using GastroMatch.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GastroMatch.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CompraController : ControllerBase
    {
        private readonly GastroContext _context;

        public CompraController(GastroContext context)
        {
            _context = context;
        }

        public class CompraRequest
        {
            public int AtividadeId { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarCompra(
            [FromBody] CompraRequest request)
        {
            // Identifica o usuário autenticado pelo cookie do projeto.
            if (!Request.Cookies.TryGetValue("Idusado", out string? idCookie)
                || !int.TryParse(idCookie, out int usuarioId)
                || usuarioId <= 0)
            {
                return Unauthorized(new
                {
                    mensagem = "Faça login para realizar a compra."
                });
            }

            if (request.AtividadeId <= 0)
            {
                return BadRequest(new
                {
                    mensagem = "Atividade inválida."
                });
            }

            var atividade = await _context.Atividades
                .FirstOrDefaultAsync(a => a.Id == request.AtividadeId);

            if (atividade == null)
            {
                return NotFound(new
                {
                    mensagem = "Curso ou receita não encontrado."
                });
            }

            // Impede registrar novamente uma atividade já adquirida.
            var compraExistente = await _context.Compras
                .AnyAsync(c =>
                    c.Fk_Usuario_Id == usuarioId &&
                    c.Fk_Atividade_Id == request.AtividadeId &&
                    c.Status == 2);

            if (compraExistente)
            {
                return Conflict(new
                {
                    mensagem = "Você já possui essa atividade."
                });
            }

            var compra = new Compra
            {
                Fk_Usuario_Id = usuarioId,
                Fk_Atividade_Id = atividade.Id,
                Valor_Pago = atividade.Valor,
                Data_Compra = DateTime.Now,
                Status = 2
            };

            _context.Compras.Add(compra);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Compra registrada com sucesso!",
                compra.Id,
                atividadeId = compra.Fk_Atividade_Id,
                status = compra.Status
            });
        }
    }
}
