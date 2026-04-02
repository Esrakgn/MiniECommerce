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
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    //tablo olarak hangi entitylerin oluşturulacağını belirtiyoruz.
    protected override void OnModelCreating(ModelBuilder modelBuilder) //modelbuilder: entitylerin nasıl tabloya dönüşeceğini kuran araç.
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Cart>()
            .HasOne(x => x.User)// bir cart bir usera ait olabilir
            .WithMany() //bir userın birden fazla cartı olabilir, ancak bu senaryoda her userın sadece bir cartı olduğunu varsayıyoruz.
            .HasForeignKey(x  => x.UserId) //sepet tablosunda userId foreign key olarak tanımlanır
            .OnDelete(DeleteBehavior.Cascade); //bir user silindiğinde ona ait sepetin de silinmesini sağlar.

        modelBuilder.Entity<CartItem>()
            .HasOne(x => x.Cart)// bir cartItem bir cart a ait olabilir
            .WithMany(x => x.Items) //bir cartın birden fazla cartItemı olabilir, bu yüzden Items koleksiyonunu kullanıyoruz.
            .HasForeignKey(x => x.CartId) //cartItem tablosunda cartId foreign key olarak tanımlanır
            .OnDelete(DeleteBehavior.Cascade); 

        modelBuilder.Entity<CartItem>() //cart itemin hangi ürünü tuttuğunu belirtir
            .HasOne(x => x.Product) // bir cartItem bir product a ait olabilir
            .WithMany()
            .HasForeignKey(x => x.ProductId) //
            .OnDelete(DeleteBehavior.Cascade);
    }
}
//EF Core’un veritabanıyla konuştuğu ana sınıftır.