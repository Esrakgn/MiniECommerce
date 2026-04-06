using Microsoft.EntityFrameworkCore;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Exceptions;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Domain.Common;
using MiniECommerce.Domain.Entities;
using MiniECommerce.Infrastructure.Persistence;

namespace MiniECommerce.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> CheckoutAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cart is null)
        {
            throw new NotFoundException("Cart not found.");
        }

        if (!cart.Items.Any())
        {
            throw new BadRequestException("Cart is empty.");
        }

        foreach (var item in cart.Items)
        {
            if (item.Quantity > item.Product.Stock)
            {
                throw new BadRequestException($"Not enough stock for product: {item.Product.Name}");
            }
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = cart.Items.Sum(x => x.Product.Price * x.Quantity),
            Status = OrderStatus.SiparisAlindi
        };

        foreach (var item in cart.Items)
        {
            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.Product.Price,
                TotalPrice = item.Product.Price * item.Quantity
            };

            order.Items.Add(orderItem);

            item.Product.Stock -= item.Quantity;
        }

        var orderItemsDto = cart.Items.Select(item => new OrderItemDto
        {
            OrderItemId = order.Items.First(oi => oi.ProductId == item.ProductId).Id,
            ProductId = item.ProductId,
            ProductName = item.Product.Name,
            Quantity = item.Quantity,
            UnitPrice = item.Product.Price,
            TotalPrice = item.Product.Price * item.Quantity
        }).ToList();

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.Items);

        await _context.SaveChangesAsync();

        return new OrderDto
        {
            OrderId = order.Id,
            UserId = order.UserId,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Items = orderItemsDto
        };
    }

    // Checkout işlemi, kullanıcının sepetindeki ürünleri siparişe dönüştürür ve veritabanına kaydeder.

    public async Task<List<OrderDto>> GetMyOrdersAsync(Guid userId)
    {
        var orders = await _context.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.OrderDate)
            .ToListAsync();

        return orders.Select(order => new OrderDto
        {
            OrderId = order.Id,
            UserId = order.UserId,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Items = order.Items.Select(item => new OrderItemDto
            {
                OrderItemId = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList()
        }).ToList();
    }

    // GetMyOrdersAsync, kullanıcının geçmiş siparişlerini getirir.

    public async Task CancelOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _context.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.UserId == userId);

        if (order is null)
        {
            throw new NotFoundException("Order not found.");
        }

        if (order.Status == OrderStatus.IptalEdildi)
        {
            throw new BadRequestException("Order is already cancelled.");
        }

        foreach (var item in order.Items)
        {
            item.Product.Stock += item.Quantity;
        }

        order.Status = OrderStatus.IptalEdildi;

        await _context.SaveChangesAsync();
    }
}
