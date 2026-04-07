using Microsoft.EntityFrameworkCore;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Exceptions;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Domain.Entities;
using MiniECommerce.Infrastructure.Persistence;

namespace MiniECommerce.Infrastructure.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly AppDbContext _context;

        public FavoriteService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductDto>> GetFavoritesAsync(Guid userId)
        {
            return await _context.Favorites
                .Where(x => x.UserId == userId)
                .Select(x => new ProductDto
                {
                    Id = x.Product!.Id,
                    Name = x.Product.Name,
                    Description = x.Product.Description,
                    Price = x.Product.Price,
                    Stock = x.Product.Stock,
                    Category = x.Product.Category,
                    ImageUrl = x.Product.ImageUrl
                })
                .ToListAsync();
        }
        //kullanıcının favori ürünlerini ürün bilgileriyle birlikte dönüyoz

        public async Task AddFavoriteAsync(Guid userId, Guid productId)
        {
            var productExists = await _context.Products.AnyAsync(x => x.Id == productId);

            if (!productExists)
            {
                throw new NotFoundException("Product not found.");
            }

            var alreadyExists = await _context.Favorites
                .AnyAsync(x => x.UserId == userId && x.ProductId == productId);

            if (alreadyExists)
            {
                return;
            }
            //aynı ürün iki kere favoriye eklenmesin diye önce kontrol ediyoz

            var favorite = new Favorite
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ProductId = productId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveFavoriteAsync(Guid userId, Guid productId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);

            if (favorite is null)
            {
                return;
            }
            //favoride yoksa hata vermek yerine sessizce çıkıyoz

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
        }
    }
}
