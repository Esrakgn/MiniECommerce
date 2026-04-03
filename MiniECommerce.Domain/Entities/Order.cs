using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Domain.Common; 

namespace MiniECommerce.Domain.Entities
{
    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }
        public AppUser User { get; set; } = null!;

        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }

        public List<OrderItem> Items { get; set; } = new();//bir siparişin birden fazla ürünü olabilir
    }
}
//sipariş kaydı
//sipariş veren kullanıcı bilgisi, zaman, toplam tutar ve sipariş içindeki ürünlerin bilgisi tutulur