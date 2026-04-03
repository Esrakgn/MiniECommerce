using System;
using System.Collections.Generic;
using System.Text;

namespace MiniECommerce.Application.DTOs
{
    public class OrderDto
    {
        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
//tüm sipariş bilgisi
//cart tarafındaki yapının sipariş versiyonu 
