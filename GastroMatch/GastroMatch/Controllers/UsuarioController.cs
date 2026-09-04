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
                    u.Chef,
                    u.Restaurante,
                    u.Cliente
                })
                .FirstOrDefaultAsync();

            if (usuario is null)
                return Unauthorized(new { mensagem = "Usuário não encontrado." });

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
            var usuarioBd = _context.Usuarios.Where
                    (c => c.Email.Equals(login.Email) && 
                    c.Senha.Equals(login.Senha)).ToList();


            if (usuarioBd.Count == 0)

                return Unauthorized("Email ou Senha Incorretos");
            HttpContext.Session.SetString("Idusado", usuarioBd[0].Id.ToString());
            Response.Cookies.Append("Idusado", usuarioBd[0].Id.ToString(),

                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None
                });

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
    }
}
