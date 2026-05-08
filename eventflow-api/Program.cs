using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

//Database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
        builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

//Authentication setup
var jwt = builder.Configuration.GetSection("JwtSettings");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters 
    = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt["Key"]!))
    };
    // For SignalR authentication via query string
     options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/eventFlowHub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtHelper>();

builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<FileHelper>();
builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<WatchlistService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<TicketService>();

//The difference between AddScoped and AddSingleton is that AddScoped creates a new instance of the service for each HTTP request, while AddSingleton creates a single instance that is shared across all requests.
// In this case, since QrCodeHelper does not maintain any state and can be reused across requests, we can register it as a singleton to improve performance and reduce memory usage.
builder.Services.AddSingleton<QrCodeHelper>();
builder.Services.AddSignalR();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters
        .Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

//middleware for global exception handling, we will create a custom middleware class for this later
//app.UseMiddleware<ExceptionMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
app.UseCors("ReactApp");
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
//for real time features
app.MapHub<EventFlowHub>("/eventFlowHub");

app.Run();