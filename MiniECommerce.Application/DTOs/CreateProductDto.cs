using System;
using System.Collections.Generic;
using System.Text;

namespace MiniECommerce.Application.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock {  get; set; }
        public string Category { get; set; } = string.Empty;
    }
}
//yeni ürün eklerken dışarıdan alınacak veri, id backend kendi üretiyor.
