using System.Text;
using back_net.Services;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// builder.Services.AddAuthentication()
//   .AddJwtBearer(options => options.TokenValidationParameters = new()
//   {
//     ValidateIssuer = false,
//     ValidateAudience = false,
//     ValidateLifetime = false,
//     ValidateIssuerSigningKey = true,
//     IssuerSigningKey = new SymmetricSecurityKey(
//       Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)
//     )
//   });
// builder.Services.AddAuthorization();

builder.Services.AddMemooServices(builder.Configuration);
builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
