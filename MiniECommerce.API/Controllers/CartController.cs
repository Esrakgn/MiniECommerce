using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;

namespace MiniECommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }




    [HttpPost("items")]
    public async Task<IActionResult> AddToCart(AddToCartDto request)
    {
        var userId = GetUserId();
        await _cartService.AddToCartAsync(userId, request);
        return Ok(new { message = "Product added to cart." });
    }
    //ürün ve adet 



    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        var cart = await _cartService.GetCartAsync(userId);
        return Ok(cart);
    }
    //kullanıcının kendi sepetini getirir



    [HttpPut("items/{cartItemId:guid}")]
    public async Task<IActionResult> UpdateCartItemQuantity(Guid cartItemId, UpdateCartItemQuantityDto request)
    {
        var userId = GetUserId();
        await _cartService.UpdateCartItemQuantityAsync(userId, cartItemId, request);
        return NoContent();
    }
    //sepetteki ürün miktarını günceller




    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveFromCart(Guid cartItemId)
    {
        var userId = GetUserId();
        await _cartService.RemoveFromCartAsync(userId, cartItemId);
        return NoContent();
    }
    //sepetten ürün çıkarmak




    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        await _cartService.ClearCartAsync(userId);
        return NoContent();
    }
    //sepetteki itemleri temizler 

    private Guid GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; //Claim varsa değerini al yoksa null

        if (string.IsNullOrWhiteSpace(userId))// claim bulunamadıysa hata
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        return Guid.Parse(userId);//token içinde string olan kullanıcı id kısmını guide çeviriyoruz
  //yani giriş yapan kullanıcının tokenindaki usser id'yi alıyoruz, boşsa hata doluysa guide çevirip döner 
    }
}
