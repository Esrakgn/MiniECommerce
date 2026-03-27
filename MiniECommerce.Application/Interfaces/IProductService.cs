using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Domain.Entities;

namespace MiniECommerce.Application.Interfaces;

public  interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(int pageNumber, int pageSize); //pagination
    Task<ProductDto?> GetByIdAsync(Guid id); //ürün detayını id ile çekeceğimiz için guid id
    Task<Guid> CreateAsync(CreateProductDto request); 

}
//ürün işlemleri 