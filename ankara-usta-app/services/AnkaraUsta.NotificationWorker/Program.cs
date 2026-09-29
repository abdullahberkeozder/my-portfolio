using AnkaraUsta.NotificationWorker;

var builder = WebApplication.CreateBuilder(args);

var options = builder.Configuration
    .GetSection(NotificationWorkerOptions.SectionName)
    .Get<NotificationWorkerOptions>() ?? new NotificationWorkerOptions();

builder.Services.AddSingleton(options);
builder.Services.AddHttpClient<ISupabaseOutboxClient, SupabaseOutboxClient>();
builder.Services.AddHttpClient<IEmailSender, ResendEmailSender>();
builder.Services.AddSingleton<NotificationTemplateRenderer>();
builder.Services.AddTransient<NotificationBatchProcessor>();
builder.Services.AddHostedService<NotificationDeliveryWorker>();

var app = builder.Build();

app.MapNotificationHealthEndpoints(options);

await app.RunAsync();
