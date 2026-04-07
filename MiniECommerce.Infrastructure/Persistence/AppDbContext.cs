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
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Favorite> Favorites { get; set; }



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

        modelBuilder.Entity<Order>()
           .HasOne(x => x.User)  //bir order bir usera ait olabilir
           .WithMany() //user --> many order 
           .HasForeignKey(x => x.UserId)
           .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Order)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Product)//bir orderItem bir product a ait olabilir
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict); //bu ürüne bağlı order item varken ürün silinmez

        modelBuilder.Entity<Favorite>()
           .HasIndex(x => new { x.UserId, x.ProductId })
           .IsUnique();
           //aynı kullanıcı aynı ürünü bir kere favorileyebilsin diye unique verdik

        modelBuilder.Entity<Favorite>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        //user ya da product silinirse ona bağlı favori kayıtları da temizlensin diye cascade verdik


    }
}
//EF Core’un veritabanıyla konuştuğu ana sınıftır.
//Cart için cascade kabul edilir çünkü sepet geçiici cart silinince item'ların gitmesi sorun değil
//Order için cascade kabul edilmez. restrick kullandık çünkü siparişler kalıcıdır,
//bir sipariş silindiğinde ona bağlı order itemların da silinmesi istenmez. kayıt bozulmamamlı 