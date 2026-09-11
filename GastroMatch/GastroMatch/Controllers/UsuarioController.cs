using GastroMatch.Data;
using GastroMatch.DTOs;
using GastroMatch.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace GastroMatch.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class UsuarioController : ControllerBase
    {
        private readonly GastroContext _context;

        public UsuarioController(GastroContext context)
        {
            _context = context;
        }


        [HttpGet("perfil")]
        public async Task<IActionResult> Perfil()
        {
            var idUsuario = ObterIdUsuarioLogado();

            if (idUsuario is null)
                return Unauthorized(new { mensagem = "Usuário não autenticado." });


            var usuario = await _context.Usuarios
                .AsNoTracking()
                .Where(u => u.Id == idUsuario.Value)
                .Select(u => new
                {
                    u.Id,
                    u.Nome,
                    u.Email,
                    u.Telefone,

                    u.Chef,
                    u.Restaurante,
                    u.Cliente,

                    u.Cnpj,
                    u.Certificado,

                    u.StatusCnpj,
                    u.StatusCertificado,

                    u.Foto_perfil,
                    u.Bio
                })
                .FirstOrDefaultAsync();


            if (usuario is null)
                return Unauthorized(new
                {
                    mensagem = "Usuário não encontrado."
                });


            return Ok(usuario);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            Response.Cookies.Delete("Idusado", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return NoContent();
        }

        private int? ObterIdUsuarioLogado()
        {
            var idTexto = HttpContext.Session.GetString("Idusado")
                ?? Request.Cookies["Idusado"];

            return int.TryParse(idTexto, out var id) ? id : null;
        }


        [HttpPost("login")]
        public IActionResult Login(Login login)
        {
            var usuarioBd = _context.Usuarios
                .Where(c =>
                    c.Email == login.Email &&
                    c.Senha == login.Senha
                )
                .Select(c => new
                {
                    c.Id
                })
                .FirstOrDefault();


            if (usuarioBd == null)
            {
                return Unauthorized("Email ou Senha Incorretos");
            }


            HttpContext.Session.SetString(
                "Idusado",
                usuarioBd.Id.ToString()
            );


            Response.Cookies.Append(
                "Idusado",
                usuarioBd.Id.ToString(),
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None
                }
            );


            return Ok("");
        }


        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar(CadastroUsuarioDTO dto)
        {
            var usuario = new Usuario
            {
                Nome = dto.Nome,
                Email = dto.Email,
                Telefone = dto.Telefone,
                Senha = dto.Senha,

                Chef = dto.Chef,
                Restaurante = dto.Restaurante,
                Cliente = dto.Cliente,

                Cnpj = null,
                Certificado = null,

                StatusCnpj = dto.Restaurante ? "Pendente" : "NaoSolicitado",
                StatusCertificado = dto.Chef ? "Pendente" : "NaoSolicitado"
            };

            _context.Usuarios.Add(usuario);

            await _context.SaveChangesAsync();

            return Created("", new
            {
                mensagem = "Usuário cadastrado com sucesso.",
                id = usuario.Id
            });
        }
    



[HttpPost("enviar-arquivo")]
        public async Task<IActionResult> EnviarArquivo(IFormFile arquivo)
        {
            var idUsuario = ObterIdUsuarioLogado();

            if (idUsuario is null)
                return Unauthorized(new { mensagem = "Usuário não autenticado." });

            if (arquivo == null || arquivo.Length == 0)
                return BadRequest(new { mensagem = "Selecione um arquivo PDF." });

            // Aceita somente PDF
            if (Path.GetExtension(arquivo.FileName).ToLower() != ".pdf")
                return BadRequest(new { mensagem = "O arquivo deve ser um PDF." });

            // Limite de 10 MB
            if (arquivo.Length > 10 * 1024 * 1024)
                return BadRequest(new { mensagem = "O arquivo não pode ter mais de 10 MB." });

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

            if (usuario == null)
                return NotFound(new { mensagem = "Usuário não encontrado." });

            // Verifica se é Chef ou Restaurante
            if (!usuario.Chef && !usuario.Restaurante)
                return Unauthorized(new
                {
                    mensagem = "Somente Chef ou Restaurante pode enviar documentos."
                });

            string pasta;

            if (usuario.Chef)
            {
                pasta = "certificados";
            }
            else
            {
                pasta = "cnpj";
            }

            var caminhoPasta = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                pasta
            );

            if (!Directory.Exists(caminhoPasta))
                Directory.CreateDirectory(caminhoPasta);

            var nomeArquivo = Guid.NewGuid().ToString() + ".pdf";

            var caminhoArquivo = Path.Combine(caminhoPasta, nomeArquivo);

            using (var stream = new FileStream(caminhoArquivo, FileMode.Create))
            {
                await arquivo.CopyToAsync(stream);
            }

            var caminhoBanco = $"/uploads/{pasta}/{nomeArquivo}";

            if (usuario.Chef)
            {
                usuario.Certificado = caminhoBanco;
                usuario.StatusCertificado = "Aprovado";
            }
            else if (usuario.Restaurante)
            {
                usuario.Cnpj = caminhoBanco;
                usuario.StatusCnpj = "Aprovado";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Documento enviado e cadastro validado com sucesso.",
                status = "Aprovado"
            });
        }
    }
}