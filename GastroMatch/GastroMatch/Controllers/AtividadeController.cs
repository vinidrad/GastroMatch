using GastroMatch.Data;
using GastroMatch.DTOs;
using GastroMatch.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GastroMatch.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AtividadesController : ControllerBase
    {
        private readonly GastroContext _context;

        public AtividadesController(GastroContext context)
        {
            _context = context;
        }








        [HttpGet("{id:int}")]
        public async Task<IActionResult> BuscarAtividadePorId(int id)
        {
            var atividade = await _context.Atividades
                .Include(a => a.Aulas)
                .Include(a => a.Usuario)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (atividade == null)
                return NotFound("Atividade não encontrada.");

            var aulas = atividade.Aulas
                .OrderBy(a => a.Ordem)
                .Select(a => new
                {
                    a.Id,
                    a.Titulo,
                    a.Ordem
                })
                .ToList();

            return Ok(new
            {
                atividade.Id,
                atividade.Nome,
                atividade.Descricao,
                atividade.Sobre,
                atividade.Tipo,
                atividade.Categoria,
                atividade.Valor,
                atividade.Tempo_Curso,

                Imagem = atividade.Imagem != null
                    ? $"{Request.Scheme}://{Request.Host}/uploads/capas/{atividade.Imagem}"
                    : null,

                Criador = atividade.Usuario != null
                    ? atividade.Usuario.Nome
                    : "Instrutor não informado",

                Aulas = aulas
            });
        }








        [HttpGet]
        public IActionResult BuscarAtividades()
        {
            var atividades = _context.Atividades
                .Select(a => new
                {
                    a.Id,
                    a.Nome,
                    a.Categoria,
                    Imagem = a.Imagem != null
                        ? $"{Request.Scheme}://{Request.Host}/uploads/capas/{a.Imagem}"
                        : null 
                })
                .ToList();

            return Ok(atividades);
        }

        [HttpGet("categoria/{categoria}")]
        public IActionResult BuscarPorCategoria(string categoria)
        {
            var atividades = _context.Atividades
                .Where(a => a.Categoria == categoria)
                .Select(a => new
                {
                    a.Id,
                    a.Nome,
                    a.Categoria,
                    Imagem = a.Imagem != null
                        ? $"{Request.Scheme}://{Request.Host}/uploads/capas/{a.Imagem}"
                        : null
                })
                .ToList();

            return Ok(atividades);
        }


        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar([FromForm] AtividadeCadastroDTO dto)
        {


            var usuarioBd = await _context.Usuarios
     .FirstOrDefaultAsync(c => c.Id == dto.Fk_Usuario_Id);

            if (usuarioBd == null)
            {
                return Unauthorized("ERRO: usuário não encontrado.");
            }

            if (usuarioBd.Cliente)
            {
                return Unauthorized("ERRO: usuário está marcado como Cliente.");
            }

            if (!usuarioBd.Chef && !usuarioBd.Restaurante)
            {
                return Unauthorized("ERRO: usuário não é Chef nem Restaurante.");
            }

            if (usuarioBd.Chef)
            {
                if (usuarioBd.StatusCertificado != "Aprovado")
                {
                    return Unauthorized(
                        "ERRO: certificado do Chef não está aprovado."
                    );
                }
            }

            if (usuarioBd.Restaurante)
            {
                if (usuarioBd.StatusCnpj != "Aprovado")
                {
                    return Unauthorized(
                        "ERRO: CNPJ do Restaurante não está aprovado."
                    );
                }
            }



            if (string.IsNullOrWhiteSpace(dto.Nome))
            {
                return BadRequest("Informe o nome da atividade.");
            }

            if (string.IsNullOrWhiteSpace(dto.Categoria))
            {
                return BadRequest("Informe a categoria.");
            }

            if (dto.Tipo != 1 && dto.Tipo != 2)
            {
                return BadRequest("Tipo de atividade inválido.");
            }

            if (dto.Valor < 0)
            {
                return BadRequest("O valor não pode ser negativo.");
            }



            var pastaUploads = Path.Combine(
     Directory.GetCurrentDirectory(),
     "wwwroot",
     "uploads"
 );

            var pastaCapas = Path.Combine(
                pastaUploads,
                "capas"
            );

            var pastaAulas = Path.Combine(
                pastaUploads,
                "aulas"
            );

            if (!Directory.Exists(pastaUploads))
            {
                Directory.CreateDirectory(pastaUploads);
            }

            if (!Directory.Exists(pastaCapas))
            {
                Directory.CreateDirectory(pastaCapas);
            }

            if (!Directory.Exists(pastaAulas))
            {
                Directory.CreateDirectory(pastaAulas);
            }

            if (!Directory.Exists(pastaUploads))
            {
                Directory.CreateDirectory(pastaUploads);
            }

            string nomeImagem = null;

            if (dto.Imagem != null && dto.Imagem.Length > 0)
            {
                var extensao = Path.GetExtension(dto.Imagem.FileName);

                nomeImagem = Guid.NewGuid().ToString() + extensao;

                var caminhoImagem = Path.Combine(
     pastaCapas,
     nomeImagem
 );

                using (var stream = new FileStream(
                    caminhoImagem,
                    FileMode.Create))
                {
                    await dto.Imagem.CopyToAsync(stream);
                }
            }

            var atividade = new Atividade
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Tipo = dto.Tipo,
                Sobre = dto.Sobre,
                Categoria = dto.Categoria,
                Valor = dto.Valor,
                Tempo_Curso = dto.Tempo_Curso,
                Imagem = nomeImagem,
                Fk_Usuario_Id = dto.Fk_Usuario_Id,
                Data_Cadastro = DateTime.Now
            };

            _context.Atividades.Add(atividade);

            await _context.SaveChangesAsync();

            if (dto.Tipo == 1)
            {
                if (dto.Aulas == null || dto.Aulas.Count == 0)
                {
                    return BadRequest("Nenhuma aula chegou ao backend.");
                }

                int ordem = 1;

                foreach (var aulaDto in dto.Aulas)
                {
                    if (aulaDto.Video == null || aulaDto.Video.Length == 0)
                    {
                        return BadRequest($"O vídeo da aula {ordem} não chegou ao backend.");
                    }

                    var extensaoVideo = Path.GetExtension(aulaDto.Video.FileName);
                    var nomeVideo = Guid.NewGuid().ToString() + extensaoVideo;

                    var caminhoVideo = Path.Combine(pastaAulas, nomeVideo);

                    using (var stream = new FileStream(caminhoVideo, FileMode.Create))
                    {
                        await aulaDto.Video.CopyToAsync(stream);
                    }

                    var aula = new Aula
                    {
                        Fk_Atividade_Id = atividade.Id,
                        Titulo = aulaDto.Titulo,
                        Video = nomeVideo,
                        Ordem = ordem,
                        Data_Cadastro = DateTime.Now
                    };

                    _context.Aulas.Add(aula);

                    ordem++;
                }

                await _context.SaveChangesAsync();
            }


            return Ok(new
            {
                mensagem = "Atividade cadastrada com sucesso!",
                id = atividade.Id
            });
        }
    }
}