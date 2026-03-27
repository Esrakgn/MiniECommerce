using System;
using System.Collections.Generic;
using System.Text;

namespace MiniECommerce.Domain.Common
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
    }
}
// Ortak alanları tek yerde toplamak için.