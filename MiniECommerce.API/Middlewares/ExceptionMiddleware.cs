using System.Net;
using System.Text.Json;
using MiniECommerce.Application.Exceptions;


namespace MiniECommerce.API.Middlewares   
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;  //hata olduğunda log yazamk için

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context); //request’i normal akışa bırakıyor
            }


            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred."); // bu satır log basar 

                context.Response.ContentType = "application/json";

                var statusCode = ex switch
                {
                    NotFoundException => (int)HttpStatusCode.NotFound, //ec türüne bakıp ona göre hata döner 
                    _ => (int)HttpStatusCode.InternalServerError //varsayılan 500 hatası döner
                };

                var message = ex switch
                {
                    NotFoundException => ex.Message,
                    _ => "An unexpected error occurred. Please try again later."
                };
                //hata 404 ise exception mesajını döner, diğer durumlarda genel bir hata mesajı döner

                context.Response.StatusCode = statusCode;

                var response = new
                {
                    statusCode = statusCode,
                    message = message
                };

                var json = JsonSerializer.Serialize(response);
                await context.Response.WriteAsync(json);
            }

        }
    }
}
