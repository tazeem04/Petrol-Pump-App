using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(x =>
   x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 1. Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. CORS (React ko ijazat)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- YE SECTION SAB SE AHAM HAI ---

// 1. Static Files Enable karein (Taake uploads nazar aayein)
app.UseStaticFiles();

// 2. CORS Use karein
app.UseCors("AllowReact");

// 3. Routing aur baki middlewares
app.UseHttpsRedirection();
app.UseRouting(); // Routing lazmi hai controllers se pehle
app.UseAuthorization();

app.MapControllers();

app.Run();