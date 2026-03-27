using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;

namespace MiniECommerce.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var products = await _productService.GetAllAsync(pageNumber, pageSize);
        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _productService.GetByIdAsync(id);

        if (product is null)
        {
            return NotFound(new { message = "Urun bulunamadi." });
        }

        return Ok(product);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto request)
    {
        var productId = await _productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = productId }, new { id = productId });
    }
}
