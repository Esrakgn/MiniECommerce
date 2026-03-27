using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;
using MiniECommerce.Domain.Entities;

namespace MiniECommerce.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<AppUser> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);
    }
}
//EF Core’un veritabanıyla konuştuğu ana sınıftır.