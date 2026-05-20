using System.Text.RegularExpressions;
using FluentResults;
using Resend;

namespace back_net.Services.Email;

public class EmailManager(IResend resend)
{
  private static readonly Regex _emailRegex = new(
    @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    RegexOptions.Compiled | RegexOptions.Singleline | RegexOptions.CultureInvariant
  );

  public string? CheckEmail(string email)
  {
    if (!_emailRegex.IsMatch(email))
      return "Incorrect email (basic check)";
    return null;
  }

  public async ValueTask<Result> SendVerificationCode(string email, string code, CancellationToken ct)
  {
    var emailData = new EmailMessage
    {
      From = "deadlion@inversedca.ru",
      To = email,
      Subject = "Memoo verification code",
      HtmlBody = "<table><tr><b>Verification code:</b></tr>" +
        $"<trstyle=\"font-family:'Lucida Console', monospace\">{code}</tr></table>"
    };
    var respond = await resend.EmailSendAsync(emailData, ct);
    if (!respond.Success)
      return Result.Fail("Failed to send email");
    return Result.Ok();
  }
}
