using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Domain.Common;

namespace MiniECommerce.Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public ProductCategory Category { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    //ürünü dışarıya dönerken resmi de göndercemiz için ekliyoruz
}
// Ürünü dışarıya dönerken kullandığımız güvenli şekil.
