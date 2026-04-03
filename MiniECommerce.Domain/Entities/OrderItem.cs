using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Domain.Common;

namespace MiniECommerce.Domain.Entities
{
    public class OrderItem : BaseEntity
    {
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!; // bir ürünün hangi siparişe ait olduğunu gösterir

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // ürünün birim fiyatı
        public decimal TotalPrice {  get; set; } // ürünün toplam fiyatı (birim fiyat * miktar)
    }
}
//sipariş içindeki ürün kayıtları