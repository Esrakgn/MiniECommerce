using System;
using System.Collections.Generic;
using System.Text;

using MiniECommerce.Domain.Entities;

namespace MiniECommerce.Application.Interfaces;

public interface ITokenService
{
    string CreateToken(AppUser user);
}
// JWT üretme kısmı 