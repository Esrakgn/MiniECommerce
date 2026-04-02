using System;
using System.Collections.Generic;
using System.Text;
using MiniECommerce.Application.DTOs;

namespace MiniECommerce.Application.Interfaces
{
    public interface ICartService
    {
        Task AddToCartAsync(Guid userId, AddToCartDto request);
        Task<CartDto> GetCartAsync(Guid userId);
        Task RemoveFromCartAsync(Guid userId, Guid cartItemId);
        Task ClearCartAsync(Guid userId);

    }
}
