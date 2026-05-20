using back_net.Services;
using back_net.Services.Email;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace back_net.Controllers;

public class SendCodeRequest
{
  public required string Email { get; set; }
}

public class VerifyCodeRequest
{
  public required string Email { get; set; }
  public required string Code { get; set; }
}

[ApiController]
[Route("[controller]")]
public class AuthController(
  CodeManager codeManager,
  EmailManager emailManager,
  JwtTokenManager jwtTokenManager,
  VerificationCodeStorage verificationCodeStorage) : ControllerBase
{
  [HttpPost("email")]
  public async Task<IActionResult> SendCode(
    [FromBody] SendCodeRequest sendCodeRequest,
    CancellationToken ct)
  {
    // true for not null:
    if (emailManager.CheckEmail(sendCodeRequest.Email) is string res)
      return BadRequest(res);

    string code = codeManager.GenVerificationCode();
    var sent = await emailManager.SendVerificationCode(sendCodeRequest.Email, code, ct);

    if (sent.IsFailed)
      return StatusCode(500, $"Failed to send email: {sent.Errors[0].Message}");
    verificationCodeStorage.StoreCode(sendCodeRequest.Email, code);
    return Ok();
  }

  [HttpPost("code")]
  public IActionResult VerifyCode([FromBody] VerifyCodeRequest verifyCodeRequest)
  {
    // TODO
    // var err = verificationCodeStorage.VerifyCode(verifyCodeRequest.Email, verifyCodeRequest.Code);
    // if (err.IsFailed)
    //   return BadRequest(err.Errors[0].Message);
    // TODO
    return Ok(jwtTokenManager.GenerateToken(0));
  }
}