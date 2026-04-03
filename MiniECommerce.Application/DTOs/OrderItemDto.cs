using System;
using System.Collections.Generic;
using System.Text;

namespace MiniECommerce.Application.DTOs
{
    public class OrderItemDto
    {
        public Guid OrderItemId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
//sipariş içindeki tek ürün satırı
//her ürün satırı için bu dto kullanılacak