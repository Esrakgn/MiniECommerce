using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Domain.Common;
using MiniECommerce.Domain.Entities;
using MiniECommerce.Infrastructure.Persistence;

namespace MiniECommerce.Infrastructure.Services;

//kullanıcı doğrulama işlemleri
public class AuthService : IAuthService
{
    private readonly AppDbContext _context;  
    private readonly ITokenService _tokenService;
    private readonly PasswordHasher<AppUser> _passwordHasher;

    public AuthService(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = new PasswordHasher<AppUser>();
    }

    //kullanıcı kaydı işlemi
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (existingUser is not null)
        {
            throw new Exception("This email is already registered.");
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            Role = UserRole.Customer
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        //şifrelenmiş parolayı veritabanına kaydediyoruz sonra veriyabanına kayıt yapıyoruz 

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = string.Empty, // kayıt işleminden sonra token oluşturulmaz, kullanıcı giriş yapana kadar boş bırakılır
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user is null)
        {
            throw new Exception("Email or password is incorrect.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            throw new Exception("Email or password is incorrect.");
        }

        var token = _tokenService.CreateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
}
