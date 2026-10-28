
using GastroMatch.Data;
// Ajuste o namespace abaixo para o namespace do seu projeto.
using GastroMatch.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GastroMatch.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ComunidadeController : ControllerBase
    {
        private readonly GastroContext _context;

        public ComunidadeController(GastroContext context)
        {
            _context = context;
        }

        // GET: /Comunidade
        // Lista todas as perguntas e suas respostas.
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perguntas = await _context.Perguntas
                .AsNoTracking()
                .OrderByDescending(p => p.Data)
                .Select(p => new
                {
                    id = p.Id,
                    assunto = p.Assunto,
                    pergunta = p.TextoPergunta,
                    data = p.Data,
                    usuarioId = p.Fk_Usuario_Id,
                    nomeUsuario = _context.Usuarios
                        .Where(u => u.Id == p.Fk_Usuario_Id)
                        .Select(u => u.Nome)
                        .FirstOrDefault(),

                    respostas = _context.Respostas
                        .Where(r => r.Fk_Pergunta_Id == p.Id)
                        .OrderBy(r => r.Data)
                        .Select(r => new
                        {
                            id = r.Id,
                            resposta = r.TextoResposta,
                            data = r.Data,
                            usuarioId = r.Fk_Usuario_Id,
                            nomeUsuario = _context.Usuarios
                                .Where(u => u.Id == r.Fk_Usuario_Id)
                                .Select(u => u.Nome)
                                .FirstOrDefault()
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(perguntas);
        }

        // POST: /Comunidade/perguntas
        // Cadastra uma pergunta para o usuário logado.
        [HttpPost("perguntas")]
        public async Task<IActionResult> CadastrarPergunta(
            [FromBody] CriarPerguntaDto dados)
        {
            if (string.IsNullOrWhiteSpace(dados.Assunto) ||
                string.IsNullOrWhiteSpace(dados.Pergunta))
            {
                return BadRequest(new
                {
                    mensagem = "Informe o assunto e o texto da pergunta."
                });
            }

            if (!int.TryParse(Request.Cookies["Idusado"], out int usuarioId))
            {
                return Unauthorized(new
                {
                    mensagem = "Faça login para publicar uma pergunta."
                });
            }

            var usuarioExiste = await _context.Usuarios
                .AnyAsync(u => u.Id == usuarioId);

            if (!usuarioExiste)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não encontrado."
                });
            }

            var pergunta = new Pergunta
            {
                Fk_Usuario_Id = usuarioId,
                Assunto = dados.Assunto.Trim(),
                TextoPergunta = dados.Pergunta.Trim(),
                Data = DateTime.Now
            };

            _context.Perguntas.Add(pergunta);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Pergunta publicada com sucesso!",
                id = pergunta.Id
            });
        }

        // POST: /Comunidade/respostas
        // Cadastra uma resposta em uma pergunta existente.
        [HttpPost("respostas")]
        public async Task<IActionResult> CadastrarResposta(
            [FromBody] CriarRespostaDto dados)
        {
            if (string.IsNullOrWhiteSpace(dados.Resposta))
            {
                return BadRequest(new
                {
                    mensagem = "Digite uma resposta."
                });
            }

            if (!int.TryParse(Request.Cookies["Idusado"], out int usuarioId))
            {
                return Unauthorized(new
                {
                    mensagem = "Faça login para responder."
                });
            }

            var usuarioExiste = await _context.Usuarios
                .AnyAsync(u => u.Id == usuarioId);

            if (!usuarioExiste)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não encontrado."
                });
            }

            var perguntaExiste = await _context.Perguntas
                .AnyAsync(p => p.Id == dados.PerguntaId);

            if (!perguntaExiste)
            {
                return NotFound(new
                {
                    mensagem = "A pergunta informada não existe."
                });
            }

            var resposta = new Resposta
            {
                Fk_Pergunta_Id = dados.PerguntaId,
                Fk_Usuario_Id = usuarioId,
                TextoResposta = dados.Resposta.Trim(),
                Data = DateTime.Now
            };

            _context.Respostas.Add(resposta);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Resposta publicada com sucesso!",
                id = resposta.Id
            });
        }
    }

    public class CriarPerguntaDto
    {
        public string Assunto { get; set; } = string.Empty;
        public string Pergunta { get; set; } = string.Empty;
    }

    public class CriarRespostaDto
    {
        public int PerguntaId { get; set; }
        public string Resposta { get; set; } = string.Empty;
    }
}
