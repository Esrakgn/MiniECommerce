using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Domain.Entities;

namespace MiniECommerce.Application.Interfaces;

public  interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(
    int pageNumber,
    int pageSize,
    string? category,
    string? search,
    string? sortBy,
    decimal? minPrice,
    decimal? maxPrice,
    bool? inStock);


    //pagination
    Task<ProductDto?> GetByIdAsync(Guid id); //ürün detayını id ile çekeceğimiz için guid id
    Task<Guid> CreateAsync(CreateProductDto request);
    Task UpdateAsync(Guid id, UpdateProductDto request);

    Task DeleteAsync(Guid id);

}
//ürün işlemleri 