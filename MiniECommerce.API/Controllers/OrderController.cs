using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniECommerce.Application.Interfaces;

namespace MiniECommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var userId = GetUserId();
        var order = await _orderService.CheckoutAsync(userId);
        return Ok(order);
    }
    //kullanıcının mevcut cart’ından sipariş oluşturmak

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        var orders = await _orderService.GetMyOrdersAsync(userId);
        return Ok(orders);
    }
    //giriş yapmış kullanıcının tüm siparişlerini getirmek


    [HttpPut("{orderId:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid orderId)
    {
        var userId = GetUserId();
        await _orderService.CancelOrderAsync(userId, orderId);
        return NoContent();
    }
    //giriş yapan kullanıcının kendi siparişini iptal etmesi

    private Guid GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        return Guid.Parse(userId);
    }
    // JWT token içindeki kullanıcı ID'sini almak için yardımcı metot. Bu ID, sipariş işlemlerinde kullanılır.
}
