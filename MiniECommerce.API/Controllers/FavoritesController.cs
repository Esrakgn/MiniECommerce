using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniECommerce.Application.Interfaces;
using System.Security.Claims;

namespace MiniECommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetUserId();
        var favorites = await _favoriteService.GetFavoritesAsync(userId);
        return Ok(favorites);
    }
    //kullanıcının kendi favori ürünlerini getirir

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> AddFavorite(Guid productId)
    {
        var userId = GetUserId();
        await _favoriteService.AddFavoriteAsync(userId, productId);
        return Ok(new { message = "Product added to favorites." });
    }
    //ürünü favorilere ekler

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> RemoveFavorite(Guid productId)
    {
        var userId = GetUserId();
        await _favoriteService.RemoveFavoriteAsync(userId, productId);
        return NoContent();
    }
    //ürünü favorilerden kaldırır

    private Guid GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        return Guid.Parse(userId);
    }
}
