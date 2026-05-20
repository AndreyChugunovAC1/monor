using System.Collections.Concurrent;
using FluentResults;

namespace back_net.Services.Email;

public class VerificationCodeStorage
{
  private readonly ConcurrentDictionary<string, CodeData> _emailToCode = new();

  public void StoreCode(string email, string code)
  {
    var expTime = DateTime.UtcNow.AddHours(1);

    _emailToCode[email] = new(code, expTime);
  }

  // returns string in case of invalid code
  public Result VerifyCode(string email, string code)
  {
    if (!_emailToCode.TryGetValue(email, out var codeData))
      return Result.Fail("The code was not sent");

    var curTime = DateTime.UtcNow;
    if (curTime > codeData.ExpTime)
    {
      _emailToCode.TryRemove(email, out _);
      return Result.Fail("Code expired");
    }

    CleanupExpiredCodes(curTime.AddDays(1));

    if (codeData.Code != code)
    {
      var newAttemptsCount = codeData.Attempt - 1;

      if (newAttemptsCount == 0)
      {
        _emailToCode.TryRemove(email, out _);
        return Result.Fail("Incorrect code, no attempts left");
      }
      _emailToCode[email] = codeData with { Attempt = newAttemptsCount };
      return Result.Fail($"Incorrect code. {newAttemptsCount} attempt(s) left");
    }
    return Result.Ok();
  }

  private void CleanupExpiredCodes(DateTime forTime)
  {
    var codesToDel = _emailToCode
      .Where(cd => cd.Value.ExpTime < forTime.AddDays(1))
      .Select(cd => cd.Key)
      .ToList();
    foreach (var codeToDel in codesToDel)
      _emailToCode.TryRemove(codeToDel, out _);
  }

  private record CodeData(string Code, DateTime ExpTime, int Attempt = 3);
}