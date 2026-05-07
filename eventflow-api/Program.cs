using Eventflow;
using Eventflow.Data;
using Eventflow.DTOs;
using Eventflow.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;




var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

//Authentication
 var jwt = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8
            .GetBytes(jwt["Key"]!))
    };
});
builder.Services.AddAuthorization();
builder.Services.AddScoped<AuthService>();
//Later when we add more services just remove comments

//builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<TicketService>();

//The difference between AddScoped and AddSingleton is that AddScoped creates a new instance of the service for each HTTP request, while AddSingleton creates a single instance that is shared across all requests.
// In this case, since QrCodeHelper does not maintain any state and can be reused across requests, we can register it as a singleton to improve performance and reduce memory usage.
builder.Services.AddSingleton<QrCodeHelper>();
//builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<AdminService>();

builder.Services.AddScoped<JwtHelper>();
builder.Services.AddSignalR();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
options.AddPolicy("ReactApp", policy =>
policy.WithOrigins("http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));


var app = builder.Build();

//middleware for global exception handling, we will create a custom middleware class for this later
//app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("ReactApp");

app.UseRouting(); //  was missing

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

/* Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

*/
app.UseDeveloperExceptionPage();
app.Run();
