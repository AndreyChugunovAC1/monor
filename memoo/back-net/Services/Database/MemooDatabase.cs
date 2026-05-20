using back_net.Services.Database.Dto;
using Microsoft.EntityFrameworkCore;

namespace back_net.Services.Database;

public class MemooDatabase(DbContextOptions<MemooDatabase> options) : DbContext(options)
{
  public DbSet<UserDto> Users => Set<UserDto>();
  public DbSet<NoteDto> Notes => Set<NoteDto>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    // TODO
    modelBuilder.Entity<UserDto>(entity =>
    {
    });
  }
}