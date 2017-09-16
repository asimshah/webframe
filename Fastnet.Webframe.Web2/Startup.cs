using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using System.IO;
using Fastnet.Webframe.IdentityData2;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Fastnet.Webframe.Web2.Services;

namespace Fastnet.Webframe.Web2
{
    public class Startup
    {
        private readonly ILogger log;
        private string appRoot;
        public Startup(IConfiguration configuration, IHostingEnvironment env, ILogger<Startup> logger)
        {
            this.log = logger;
            appRoot = env.ContentRootPath;
            Configuration = configuration;
            var version = Microsoft.Extensions.PlatformAbstractions.PlatformServices.Default.Application.ApplicationVersion;
            log.LogInformation($"Webframe Site {version} started");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContextPool<ApplicationDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.AddTransient<IEmailSender, EmailSender>();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ApplicationDbContext appDb)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
            if (appDb.Users.ToArray().Count(x => string.IsNullOrWhiteSpace(x.NormalizedUserName) ) > 0)
            {
                log.LogInformation($"Application db user records need normalisation");
                NormalizeUserRecords(appDb);
                log.LogInformation($"Application db user records normalised");
            }
        }

        private void NormalizeUserRecords(ApplicationDbContext appDb)
        {
            try
            {
                foreach (var user in appDb.Users.ToArray())
                {
                    user.NormalizedUserName = user.UserName.ToUpperInvariant();
                    user.NormalizedEmail = user.Email.ToUpperInvariant();
                    //Debug.WriteLine($"{user.UserName}, {user.NormalizedUserName}, {user.NormalizedEmail}");
                    appDb.SaveChanges();
                }
            }
            catch (Exception)
            {
                Debugger.Break();
                throw;
            }
        }
    }
}
