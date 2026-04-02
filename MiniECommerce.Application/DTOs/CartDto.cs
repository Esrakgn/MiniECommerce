using System;
using System.Collections.Generic;
using System.Text;

namespace MiniECommerce.Application.DTOs
{
    public class CartDto
    {
        public Guid CartId { get; set; }
        public Guid UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }

    }
}
// Kullanıcıya ait sepet bilgileri
// hangi kullanıcı, sepette hangi ürünler var, toplam tutar ne gibi bilgileri içerir.