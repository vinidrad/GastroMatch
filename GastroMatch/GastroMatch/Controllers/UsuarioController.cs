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


            Console.WriteLine("===== USUARIO CRIADO =====");
            Console.WriteLine($"Chef: {usuario.Chef}");
            Console.WriteLine($"Restaurante: {usuario.Restaurante}");
            Console.WriteLine($"Cliente: {usuario.Cliente}");

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
    {
        return Unauthorized(new
        {
            mensagem = "Usuário não autenticado."
        });
    }

    if (arquivo == null || arquivo.Length == 0)
    {
        return BadRequest(new
        {
            mensagem = "Selecione um arquivo PDF."
        });
    }

    if (Path.GetExtension(arquivo.FileName).ToLower() != ".pdf")
    {
        return BadRequest(new
        {
            mensagem = "O arquivo deve ser um PDF."
        });
    }

    if (arquivo.Length > 10 * 1024 * 1024)
    {
        return BadRequest(new
        {
            mensagem = "O arquivo não pode ter mais de 10 MB."
        });
    }

    var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

    if (usuario == null)
    {
        return NotFound(new
        {
            mensagem = "Usuário não encontrado."
        });
    }

    if (!usuario.Chef && !usuario.Restaurante)
    {
        return Unauthorized(new
        {
            mensagem = "Somente Chef ou Restaurante pode enviar documentos."
        });
    }


    // =====================================
    // DEFINIR A PASTA
    // =====================================

    string pasta;

    if (usuario.Chef)
    {
        pasta = "certificados";
    }
    else
    {
        pasta = "cnpj";
    }


    // =====================================
    // CAMINHO DA PASTA
    // =====================================

    var caminhoPasta = Path.Combine(
        Directory.GetCurrentDirectory(),
        "wwwroot",
        "uploads",
        pasta
    );

    if (!Directory.Exists(caminhoPasta))
    {
        Directory.CreateDirectory(caminhoPasta);
    }


    // =====================================
    // CRIAR NOME DO ARQUIVO
    // =====================================

    var nomeArquivo = Guid.NewGuid().ToString() + ".pdf";

    var caminhoArquivo = Path.Combine(
        caminhoPasta,
        nomeArquivo
    );


    // =====================================
    // SALVAR ARQUIVO
    // =====================================

    using (var stream = new FileStream(
        caminhoArquivo,
        FileMode.Create))
    {
        await arquivo.CopyToAsync(stream);
    }


    // =====================================
    // SALVAR INFORMAÇÕES DO USUÁRIO
    // =====================================

    if (usuario.Chef)
    {
        usuario.Certificado =
            "/uploads/certificados/" + nomeArquivo;

        usuario.StatusCertificado =
            "Aprovado";
    }
    else
    {
        usuario.Cnpj =
            "/uploads/cnpj/" + nomeArquivo;

        usuario.StatusCnpj =
            "Aprovado";
    }


    // =====================================
    // SALVAR NO BANCO
    // =====================================

    await _context.SaveChangesAsync();


    // =====================================
    // RETORNAR O QUE FOI SALVO
    // =====================================

    if (usuario.Chef)
    {
        return Ok(new
        {
            mensagem = "Certificado enviado com sucesso.",

            certificado = usuario.Certificado,

            statusCertificado =
                usuario.StatusCertificado
        });
    }

    return Ok(new
    {
        mensagem = "CNPJ enviado com sucesso.",

        cnpj = usuario.Cnpj,

        statusCnpj =
            usuario.StatusCnpj
    });
}


        // =========================================================
        // CURSOS
        // =========================================================

        [HttpGet("cursos")]
        public async Task<IActionResult> Cursos()
        {
            var idUsuario = ObterIdUsuarioLogado();

            if (idUsuario is null)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não autenticado."
                });
            }

            var usuario = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

            if (usuario == null)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não encontrado."
                });
            }

            // CHEF / RESTAURANTE
            // Mostra os cursos criados pelo próprio usuário
            if (usuario.Chef || usuario.Restaurante)
            {
                var cursos = await _context.Atividades
                    .AsNoTracking()
                    .Where(a =>
                        a.Fk_Usuario_Id == idUsuario.Value &&
                        a.Tipo == 1
                    )
                    .OrderByDescending(a => a.Data_Cadastro)
                    .Select(a => new
                    {
                        a.Id,
                        a.Nome,
                        a.Descricao,
                        a.Tipo,
                        a.Categoria,
                        a.Valor,
                        a.Tempo_Curso,
                        a.Imagem,
                        a.Fk_Usuario_Id,
                        a.Data_Cadastro
                    })
                    .ToListAsync();

                return Ok(cursos);
            }

            // CLIENTE
            // Mostra somente cursos comprados e aprovados
            var cursosComprados = await (
                from compra in _context.Compras
                join atividade in _context.Atividades
                    on compra.Fk_Atividade_Id equals atividade.Id

                where
                    compra.Fk_Usuario_Id == idUsuario.Value &&
                    compra.Status == 2 &&
                    atividade.Tipo == 1

                orderby compra.Data_Compra descending

                select new
                {
                    atividade.Id,
                    atividade.Nome,
                    atividade.Descricao,
                    atividade.Tipo,
                    atividade.Categoria,
                    atividade.Valor,
                    atividade.Tempo_Curso,
                    atividade.Imagem,
                    atividade.Fk_Usuario_Id,
                    atividade.Data_Cadastro
                }
            ).ToListAsync();

            return Ok(cursosComprados);
        }


        // =========================================================
        // RECEITAS
        // =========================================================

        [HttpGet("receitas")]
        public async Task<IActionResult> Receitas()
        {
            var idUsuario = ObterIdUsuarioLogado();

            if (idUsuario is null)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não autenticado."
                });
            }

            var usuario = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

            if (usuario == null)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não encontrado."
                });
            }

            // CHEF / RESTAURANTE
            // Mostra as receitas criadas pelo próprio usuário
            if (usuario.Chef || usuario.Restaurante)
            {
                var receitas = await _context.Atividades
                    .AsNoTracking()
                    .Where(a =>
                        a.Fk_Usuario_Id == idUsuario.Value &&
                        a.Tipo == 2
                    )
                    .OrderByDescending(a => a.Data_Cadastro)
                    .Select(a => new
                    {
                        a.Id,
                        a.Nome,
                        a.Descricao,
                        a.Tipo,
                        a.Categoria,
                        a.Valor,
                        a.Tempo_Curso,
                        a.Imagem,
                        a.Fk_Usuario_Id,
                        a.Data_Cadastro
                    })
                    .ToListAsync();

                return Ok(receitas);
            }

            // CLIENTE
            // Mostra somente receitas compradas e aprovadas
            var receitasCompradas = await (
                from compra in _context.Compras
                join atividade in _context.Atividades
                    on compra.Fk_Atividade_Id equals atividade.Id

                where
                    compra.Fk_Usuario_Id == idUsuario.Value &&
                    compra.Status == 2 &&
                    atividade.Tipo == 2

                orderby compra.Data_Compra descending

                select new
                {
                    atividade.Id,
                    atividade.Nome,
                    atividade.Descricao,
                    atividade.Tipo,
                    atividade.Categoria,
                    atividade.Valor,
                    atividade.Tempo_Curso,
                    atividade.Imagem,
                    atividade.Fk_Usuario_Id,
                    atividade.Data_Cadastro
                }
            ).ToListAsync();

            return Ok(receitasCompradas);
        }


        // =========================================================
        // SALVOS / FAVORITOS
        // =========================================================

        [HttpGet("salvos")]
        public async Task<IActionResult> Salvos()
        {
            var idUsuario = ObterIdUsuarioLogado();

            if (idUsuario is null)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não autenticado."
                });
            }

            var salvos = await (
                from salvo in _context.Salvos
                join atividade in _context.Atividades
                    on salvo.Fk_Atividade_Id equals atividade.Id

                where salvo.Fk_Usuario_Id == idUsuario.Value

                orderby salvo.Data_Salvo descending

                select new
                {
                    atividade.Id,
                    atividade.Nome,
                    atividade.Descricao,
                    atividade.Tipo,
                    atividade.Categoria,
                    atividade.Valor,
                    atividade.Tempo_Curso,
                    atividade.Imagem,
                    atividade.Fk_Usuario_Id,
                    atividade.Data_Cadastro,
                    salvo.Data_Salvo
                }
            ).ToListAsync();

            return Ok(salvos);
        }


[HttpPost("salvar")]
public async Task<IActionResult> SalvarAtividade([FromBody] int atividadeId)
{
    var usuarioId = ObterIdUsuarioLogado();

    if (usuarioId == null)
        return Unauthorized("Usuário não está logado.");

    var atividadeExiste = await _context.Atividades
        .AnyAsync(a => a.Id == atividadeId);

    if (!atividadeExiste)
        return NotFound("Atividade não encontrada.");

    var jaSalvo = await _context.Salvos
        .AnyAsync(s =>
            s.Fk_Usuario_Id == usuarioId.Value &&
            s.Fk_Atividade_Id == atividadeId
        );

    if (jaSalvo)
        return Ok(new
        {
            salvo = true,
            mensagem = "Atividade já está salva."
        });

    var salvo = new Salvo
    {
        Fk_Usuario_Id = usuarioId.Value,
        Fk_Atividade_Id = atividadeId,
        Data_Salvo = DateTime.Now
    };

    _context.Salvos.Add(salvo);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        salvo = true,
        mensagem = "Atividade salva com sucesso!"
    });
}


[HttpDelete("salvar/{atividadeId:int}")]
public async Task<IActionResult> RemoverSalvo(int atividadeId)
{
    var usuarioId = ObterIdUsuarioLogado();

    if (usuarioId == null)
        return Unauthorized("Usuário não está logado.");

    var salvo = await _context.Salvos
        .FirstOrDefaultAsync(s =>
            s.Fk_Usuario_Id == usuarioId.Value &&
            s.Fk_Atividade_Id == atividadeId
        );

    if (salvo == null)
        return NotFound("Atividade não está salva.");

    _context.Salvos.Remove(salvo);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        salvo = false,
        mensagem = "Atividade removida dos salvos."
    });
}



        [HttpPut("atualizar")]
        public async Task<IActionResult> AtualizarPerfil([FromForm] AtualizarPerfilDTO dto)
        {
            var idUsuario = ObterIdUsuarioLogado();

            if (idUsuario is null)
            {
                return Unauthorized(new
                {
                    mensagem = "Usuário não autenticado."
                });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == idUsuario.Value);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensagem = "Usuário não encontrado."
                });
            }

            // Atualiza os dados permitidos
            usuario.Nome = dto.Nome;
            usuario.Telefone = dto.Telefone;
            usuario.Bio = dto.Bio ??"";

            // Se enviou uma nova foto
            if (dto.Foto != null && dto.Foto.Length > 0)
            {
                var extensao = Path.GetExtension(dto.Foto.FileName).ToLower();

                var extensoesPermitidas = new[]
                {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

                if (!extensoesPermitidas.Contains(extensao))
                {
                    return BadRequest(new
                    {
                        mensagem = "A foto deve ser JPG, JPEG, PNG ou WEBP."
                    });
                }

                if (dto.Foto.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new
                    {
                        mensagem = "A foto não pode ter mais de 5 MB."
                    });
                }

                var caminhoPasta = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "fotos"
                );

                if (!Directory.Exists(caminhoPasta))
                {
                    Directory.CreateDirectory(caminhoPasta);
                }

                var nomeArquivo = Guid.NewGuid().ToString() + extensao;

                var caminhoArquivo = Path.Combine(
                    caminhoPasta,
                    nomeArquivo
                );

                using (var stream = new FileStream(
                    caminhoArquivo,
                    FileMode.Create))
                {
                    await dto.Foto.CopyToAsync(stream);
                }

                usuario.Foto_perfil = "/uploads/fotos/" + nomeArquivo;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem = "Perfil atualizado com sucesso.",
                usuario = new
                {
                    usuario.Id,
                    usuario.Nome,
                    usuario.Email,
                    usuario.Telefone,
                    usuario.Bio,
                    usuario.Foto_perfil
                }





            });

        }


    }
}