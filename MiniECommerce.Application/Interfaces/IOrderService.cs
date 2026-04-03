using System;
using MiniECommerce.Application.DTOs;

namespace MiniECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(Guid userId);
    Task<List<OrderDto>> GetMyOrdersAsync(Guid userId);
}
// Kullanıcının checkout yapma ve siparişlerini görüntüleme işlemlerini tanımlar.
