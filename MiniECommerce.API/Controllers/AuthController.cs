using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;
using System.Security.Claims;

namespace MiniECommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
    //api endpointlerini tanıplayıp auth işlemlerini dışarı açıyor
{
    private readonly IAuthService _authService;
    // işi service veriyoz
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDto request)
    {
        var response = await _authService.RegisterAsync(request);
        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            //tokendan gelen billgileri tutan nesne 
            userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            email = User.FindFirst(ClaimTypes.Email)?.Value,
            role = User.FindFirst(ClaimTypes.Role)?.Value
            // eğer claim yoksa hata vermez null döner
        });
    }
}
