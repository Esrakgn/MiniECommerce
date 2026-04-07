using System;
using System.Collections.Generic;
using System.Text;

using MiniECommerce.Domain.Common;

namespace MiniECommerce.Domain.Entities
{
    public class Favorite : BaseEntity
    {
        public Guid UserId { get; set; }
        public AppUser? User { get; set; }

        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
    }
}
//hangi kullanıcının hangi ürünü favorilediğini tutucaz
//yani user ile product arasında favori bağı kuran tablo gibi çalışıyo
