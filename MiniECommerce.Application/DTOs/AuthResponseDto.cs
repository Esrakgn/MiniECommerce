using System;
using System.Collections.Generic;
using System.Text;

namespace MiniECommerce.Application.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
//Kullanıcı login/register olduğunda sadece token değil,
//yanında bazı temel bilgileri de dönebilir.