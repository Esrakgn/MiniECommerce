using Microsoft.EntityFrameworkCore;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Domain.Entities;
using MiniECommerce.Infrastructure.Persistence;
using MiniECommerce.Application.Exceptions;
using MiniECommerce.Domain.Common;

namespace MiniECommerce.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync(
     int pageNumber,
     int pageSize,
     ProductCategory? category,
     string? search,
     string? sortBy,
     decimal? minPrice,
     decimal? maxPrice,
     bool? inStock)

    {
        var query = _context.Products.AsQueryable();
        //product tablosunu sorgulanabilir hale getiriyor, hemen veri çekmiyo

        if (category.HasValue)
        {
            query = query.Where(x => x.Category == category.Value);
        }


        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search) || x.Description.Contains(search));
        }
        // kelimeye ve açıklamaya göre arama yapar

        if (minPrice.HasValue)
        {
            query = query.Where(x => x.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(x => x.Price <= maxPrice.Value);
        }

        if (inStock.HasValue)
        {
            query = inStock.Value
                ? query.Where(x => x.Stock > 0)
                : query.Where(x => x.Stock == 0);
        }
        //stokta olanlar 


        query = sortBy?.ToLower() switch //sort değerine bakıp ona göre uygun sıralamayı yapar
        {
            "priceasc" => query.OrderBy(x => x.Price), //k-b
            "pricedesc" => query.OrderByDescending(x => x.Price),//b-k
            "nameasc" => query.OrderBy(x => x.Name), //a-z 
            "namedesc" => query.OrderByDescending(x => x.Name), //z-a
            _ => query.OrderBy(x => x.Name) //varsa
        };

        return await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                Stock = x.Stock,
                Category = x.Category
            })
            .ToListAsync();
    }


    //ürün varsa dön, yoksa null döndür
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
                Stock = x.Stock,
                Category = x.Category
            })
            .FirstOrDefaultAsync();// ilk eşleşen ürünü döndür, yoksa null döndür
    }

    public async Task<Guid> CreateAsync(CreateProductDto request)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            Category = request.Category
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return product.Id;
    }


    public async Task UpdateAsync(Guid id, UpdateProductDto request)
    {
        var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
        {
            throw new NotFoundException("Product not found.");
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.Category = request.Category;

        await _context.SaveChangesAsync();
    }


    public async Task DeleteAsync(Guid id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
        {
            throw new NotFoundException("Product not found.");
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

}
