using Microsoft.EntityFrameworkCore;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Domain.Entities;
using MiniECommerce.Infrastructure.Persistence;

namespace MiniECommerce.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync(int pageNumber, int pageSize)
    {
        return await _context.Products
            .OrderBy(x => x.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                Stock = x.Stock
            })
            .ToListAsync();
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        return await _context.Products
            .Where(x => x.Id == id)
            .Select(x => new ProductDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                Stock = x.Stock
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Guid> CreateAsync(CreateProductDto request)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return product.Id;
    }
}
