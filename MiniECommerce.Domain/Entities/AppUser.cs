using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Domain.Common;

namespace MiniECommerce.Domain.Entities
{
    public class AppUser : BaseEntity
    {
        public string FullName { get; set; }= string.Empty;
        public string Email { get; set; } = string.Empty;
        public String PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Customer;

    }
}
//yeni kayıt varsayılan olarak customer
