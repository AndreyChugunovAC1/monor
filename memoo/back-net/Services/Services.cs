using System.Security.Cryptography;
using back_net.Services.Email;
using Resend;

namespace back_net.Services;

public static class Services
{
  extension(IServiceCollection services) {
    public IServiceCollection AddMemooServices(IConfiguration configuration)
    {
      services.AddSingleton(RandomNumberGenerator.Create());
      services.AddScoped<CodeManager>();

      // email management:
      // services.AddOptions();
      // ^ нужно для IOption, IOptionSnapshot, IOptionMonitor - уже есть в WebApplicationBuilder
      services.AddHttpClient<ResendClient>();
      services.Configure<ResendClientOptions>(configuration.GetSection("Resend"));
      services.AddTransient<IResend, ResendClient>();
      services.AddTransient<EmailManager>();

      services.AddSingleton<VerificationCodeStorage>();
      services.AddSingleton<JwtTokenManager>();
      return services;
    }
  }
}