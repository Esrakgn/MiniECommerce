using Microsoft.EntityFrameworkCore;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Infrastructure.Persistence;
using MiniECommerce.Domain.Entities;
using MiniECommerce.Application.Exceptions;

namespace MiniECommerce.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddToCartAsync(Guid userId, AddToCartDto request) //productıd ve quantity alıyoruz 
        {
           
            
            if (request.Quantity <= 0)
            {
                throw new Exception("Quantity must be greater than zero.");
            }



            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == request.ProductId);// ürün varsa eklenir kosa null

            if (product is null)
            {
                throw new NotFoundException("Product not found.");
            }

            //kullanıcının kartını buluyoruz
            var cart = await _context.Carts
                .Include(x => x.Items) //sadece sepet değil sepetin itemları da gelsin istiyoruz
                .FirstOrDefaultAsync(x => x.UserId == userId);

            //sepet yoksa yeni bir tane oluşturuyoruz ve ürünü ekliyoruz
            if (cart is null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = userId
                };

                _context.Carts.Add(cart);
            }


            //aynı ürün sepette varsa quantity güncellenir yoksa yeni bir item eklenir
            var existingItem = cart.Items
                .FirstOrDefault(x => x.ProductId == request.ProductId);

            if (existingItem is not null)
            {
                existingItem.Quantity += request.Quantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity
                };

                _context.CartItems.Add(cartItem);
            }



            await _context.SaveChangesAsync();
        }
        //belli bir kullanıcı için sepet oluşturma ve ürün ekleme işlemi





        public async Task<CartDto> GetCartAsync(Guid userId)
        {
            var cart = await _context.Carts//kullanıcının sepetini veritabanından buluyoruz
                .Include(x => x.Items)  //sepetin itemlarını da dahil ediyoruz
                .ThenInclude(x => x.Product)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (cart is null)
            {
                return new CartDto
                {
                    CartId = Guid.Empty, //yoksa boş bir sepet döndürüyoruz
                    UserId = userId,
                    Items = new List<CartItemDto>(),
                    TotalAmount = 0
                };
            }
            //kart varsa itemları CartItemDto'ya dönüştürüyoruz ve toplam tutarı hesaplıyoruz
            var items = cart.Items.Select(x => new CartItemDto //listedeki her bir item için yeni bir CartItemDto oluşturuyoruz. response olarak dönmek istiyoruz çünkü 
            {
                CartItemId = x.Id,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                UnitPrice = x.Product.Price,
                Quantity = x.Quantity,
                TotalPrice = x.Product.Price * x.Quantity
            }).ToList();


            //
            return new CartDto
            {
                CartId = cart.Id,
                UserId = cart.UserId,
                Items = items,
                TotalAmount = items.Sum(x => x.TotalPrice) //listedeki tüm totalPrice değerlerini topluyoruz 
            };
        }

        // kullanıcının sepet bilgilerini alma işlemi



        public async Task RemoveFromCartAsync(Guid userId, Guid cartItemId)
        { //Burada urün yerine cartItemId alıyoruz çünkü sepet içindeki satırın kendi kimliği var 
          
            var cart = await _context.Carts
                .Include(x => x.Items)// sepet içeriği yüklensin ki içinde arama yapabilelim 
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (cart is null)
            {
                throw new NotFoundException("Cart not found.");
            }

            var cartItem = cart.Items.FirstOrDefault(x => x.Id == cartItemId);

            if (cartItem is null)
            {
                throw new NotFoundException("Cart item not found.");
            }

            _context.CartItems.Remove(cartItem); //hatadan sonra cartItem'ı veritabanından kaldırıyoruz
            await _context.SaveChangesAsync();
        }

        // kullanıcının sepetinden belirli bir ürünü kaldırma işlemi



        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await _context.Carts
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (cart is null)
            {
                throw new NotFoundException("Cart not found.");
            }

            _context.CartItems.RemoveRange(cart.Items);
            await _context.SaveChangesAsync();
        }

        // kullanıcının sepetini tamamen temizleme işlemi
    }
}



/*
 GETCART işlemi için yapılacaklar:
kullanıcıya ait cart’ı bul
cart’ın item’larını ve ürünlerini yükle
cart yoksa boş sepet dön
cart varsa item’ları response formatına dönüştür
toplam tutarı hesapla
CartDto olarak dön

 
 */