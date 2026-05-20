using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace back_net.Services;

public class JwtTokenManager
{
  private readonly JwtSecurityTokenHandler _handler = new();
  private readonly SigningCredentials _creds;

  public JwtTokenManager(IConfiguration configuration)
  {
    var secret = Convert.FromBase64String(configuration["Jwt:Secret"]!);
    var key = new SymmetricSecurityKey(secret);
    _creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
  }

  public string GenerateToken(long userId)
  {
    var token = new JwtSecurityToken(
        claims: [new Claim("id", userId.ToString())],
        signingCredentials: _creds);
    return _handler.WriteToken(token);
  }
}