using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Domain.Common;

namespace MiniECommerce.Domain.Entities
{
    public class CartItem : BaseEntity
    {
        public Guid CartId { get; set; }
        public Cart Cart { get; set; } = null!;

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }
    }
}
// sepet içindeki her bir ürünü temsil eder.
// Her CartItem, bir ürüne ve o ürünün sepetteki miktarına sahiptir.
//product ıd ile ürünün bilgilerine erişilir, quantity ile de sepetteki miktarını tutar.