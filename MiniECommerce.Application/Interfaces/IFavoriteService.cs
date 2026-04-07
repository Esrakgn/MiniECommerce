using System;
using System.Collections.Generic;
using System.Text;

using MiniECommerce.Application.DTOs;

namespace MiniECommerce.Application.Interfaces
{
    public interface IFavoriteService
    {
        Task<List<ProductDto>> GetFavoritesAsync(Guid userId);
        Task AddFavoriteAsync(Guid userId, Guid productId);
        Task RemoveFavoriteAsync(Guid userId, Guid productId);
    }
}
//favorileri listeleme ekleme ve silme işlemlerini burdan yönetceğimiz için interface açtık
