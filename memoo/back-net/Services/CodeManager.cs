using System.Security.Cryptography;
using SimpleBase;

namespace back_net.Services;

public class CodeManager(RandomNumberGenerator rnd)
{
  public string GenVerificationCode()
  {
    var code = new byte[5];
    rnd.GetBytes(code);
    return Base32.Crockford.Encode(code);
  }

  public string GenSecret()
  {
    var code = new byte[32];
    rnd.GetBytes(code);
    return Base32.Crockford.Encode(code);
  }
}