using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniECommerce.Application.DTOs;
using MiniECommerce.Application.Interfaces;
using MiniECommerce.Domain.Common;


namespace MiniECommerce.API.Controllers;

//ürünlerle ilgili endpointleri tanımlayan controller 
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
    public async Task<IActionResult> GetAll(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] ProductCategory? category = null,
    [FromQuery] string? search = null,
    [FromQuery] string? sortBy = null,
    [FromQuery] decimal? minPrice = null,
    [FromQuery] decimal? maxPrice = null,
    [FromQuery] bool? inStock = null)
    {
        var products = await _productService.GetAllAsync(
    pageNumber,
    pageSize,
    category,
    search,
    sortBy,
    minPrice,
    maxPrice,
    inStock);


        return Ok(products);
    }




    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _productService.GetByIdAsync(id);
        //id’ye göre ürün getirir

        if (product is null)
        {
            return NotFound(new { message = "Urun bulunamadi." });
        }

        return Ok(product);
    }

    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = Enum.GetValues<ProductCategory>()
            .Select(x => new
            {
                value = (int)x,
                name = x.ToString()
            })
            .ToList();

        return Ok(categories);
    }


    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto request)
    {
        var productId = await _productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = productId }, new { id = productId });
    }


    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _productService.DeleteAsync(id);
        return NoContent();
    }



    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateProductDto request)
    {
        await _productService.UpdateAsync(id, request);
        return NoContent();
    }

   

}
