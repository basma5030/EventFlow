// Middleware/ExceptionMiddleware.cs

using Eventflow.Exceptions;
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, 
        ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = ex switch
        {
            NotFoundException    => (404, ex.Message),
            ForbiddenException   => (403, ex.Message),
            ValidationException  => (400, ex.Message),
            UnauthorizedAccessException => (401, "Unauthorized."),
            _                    => (500, _env.IsDevelopment() 
                                        ? ex.Message 
                                        : "An unexpected error occurred.")
        };

        context.Response.StatusCode = statusCode;

        var response = new
        {
            statusCode,
            message,

            // Stack trace only in Development because it can contain sensitive info
            detail = _env.IsDevelopment() ? ex.StackTrace : null
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}