using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Domain.Common;

namespace MiniECommerce.Domain.Entities
{
    public class Cart : BaseEntity
    {
        public Guid UserId { get; set; }
        public AppUser User { get; set; } = null!;

        public List<CartItem> Items { get; set; } = new();
    }
}
// kullanıcıya ait sepeti temsil eder.
// Her sepet, bir kullanıcıya aittir ve birden fazla ürün içerebilir.
