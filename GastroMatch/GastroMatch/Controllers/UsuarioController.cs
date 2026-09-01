using Microsoft.AspNetCore.Mvc;
using GastroMatch.Data;
using GastroMatch.Models;
using GastroMatch.DTOs;
using Microsoft.AspNetCore.Identity.Data;
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


        //[HttpGet("perfil/{id}")]

        //public IActionResult PerfilUsuario(int id) 
        //{
        //var usuario = _context.Usuarios
        //        .FirstOrDefault(u => u.Id == id);


        
        //}



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

        public IActionResult CadastrarUsuario(UsuarioDTO dto) {

            Usuario usuario = new Usuario(
             dto.Id,
             dto.Email,
             dto.Telefone,
             dto.Senha,
             dto.Chef,
             dto.Restaurante,
             dto.Cliente,
             true,
             0
             );
            _context.Add(usuario);
            _context.SaveChanges();
            return Created("",usuario);
        
        }
    }
}
