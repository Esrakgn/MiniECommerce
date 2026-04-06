using System;
using MiniECommerce.Application.DTOs;

namespace MiniECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(Guid userId);
    Task<List<OrderDto>> GetMyOrdersAsync(Guid userId);
    Task CancelOrderAsync(Guid userId, Guid orderId);
}
// Kullanıcının checkout yapma ve siparişlerini görüntüleme işlemlerini tanımlar.
//kullanıcı kendisi için sipariş oluşturabilir,
//geçmiş siparişlerini görebilir ve siparişlerini iptal edebilir.