using MiniECommerce.Domain.Common;
using MiniECommerce.Domain.Common;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace MiniECommerce.Domain.Entities
{
    public class Product : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }

        public ProductCategory Category { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
        //ürünün resim yolunu ya da linkini tutucaz
        //mesela internetten gelen bi url olabilir ya da frontendde public klasöründeki bir resim yolu olabilir
    }
}
//ıd alanını miras alıyo
