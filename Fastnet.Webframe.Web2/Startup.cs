using Fastnet.Webframe.IdentityData2;
using Fastnet.Webframe.Web2.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Diagnostics;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using System.Threading.Tasks;
using Fastnet.Webframe.CoreData2;
//using Fastnet.Webframe.Web2.Common;
using Microsoft.Extensions.Options;
using Fastnet.Webframe.Common2;

namespace Fastnet.Webframe.Web2
{
    public class Startup
    {
        private const string SecretKey = "4B6ECC1C-D676-4132-9FC6-04AF278A3937"; // todo: get this from somewhere secure
        private readonly SymmetricSecurityKey _signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(SecretKey));
        private readonly ILogger log;
        private readonly IHostingEnvironment hostingEnvironment;
        private string appRoot;
        public Startup(IConfiguration configuration, IHostingEnvironment env, ILogger<Startup> logger)
        {
            this.hostingEnvironment = env;
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
            services.AddOptions();
            services.Configure<CustomisationOptions>(Configuration.GetSection("CustomisationOptions"));
            services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("IdentityConnection")));

            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            //services.Configure<IdentityOptions>(options =>
            //{
            //    options.Password.RequireDigit = false;
            //    options.Password.RequireLowercase = false;
            //    options.Password.RequireUppercase = false;
            //    options.Password.RequireNonAlphanumeric = false;
            //    options.Password.RequiredLength = 8;

            //    options.User.RequireUniqueEmail = true;
            //});

            services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.Expiration = TimeSpan.FromMinutes(30);
                options.LoginPath = "/Home/AccessFailed";
                options.SlidingExpiration = true;
                options.Events = new CookieAuthenticationEvents
                {
                    OnSignedIn = c =>
                    {
                        log.LogInformation($"{c.Principal.Identity.Name} logged in");
                        return Task.CompletedTask;
                    },
                    OnSigningOut = c =>
                    {
                        log.LogInformation($"{c.HttpContext.User.Identity.Name} logged out");
                        return Task.CompletedTask;
                    }
                };
            });

            services.AddTransient<IEmailSender, EmailSender>();
            services.AddDbContext<CoreDataContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddTransient<IMemberFactory>((sp) =>
            {
                var options = sp.GetRequiredService<IOptions<CustomisationOptions>>();
                var coreDataContext = sp.GetRequiredService<CoreDataContext>();
                var loggerFactory = sp.GetRequiredService<ILoggerFactory>();
                switch (options.Value.factory)
                {
                    case "DonWhillansHut":
                        return new DWHMemberFactory(loggerFactory.CreateLogger<DWHMemberFactory>(),  options, coreDataContext);
                    default:
                        return new MemberFactory(loggerFactory.CreateLogger<MemberFactory>(), options, coreDataContext);
                }
            });


            services.AddMvc();
            //services.AddMvc(config =>
            //{
            //    var policy = new AuthorizationPolicyBuilder()
            //        .RequireAuthenticatedUser()
            //        .Build();
            //    config.Filters.Add(new AuthorizeFilter(policy));
            //});
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IOptions<CustomisationOptions> options, ApplicationDbContext appDb, CoreDataContext coreDataContext)
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

            app.UseAuthentication();



            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
            if (appDb.Users.ToArray().Count(x => string.IsNullOrWhiteSpace(x.NormalizedUserName)) > 0)
            {
                log.LogInformation($"Application db user records need normalisation");
                NormalizeUserRecords(appDb);
                log.LogInformation($"Application db user records normalised");
            }
            var pageCount = coreDataContext.Pages.Count();
            Debugger.Break();
        }
        private void DebugSomeCoreDataStats(CoreDataContext ctx)
        {
            log.LogInformation($"page Count: {ctx.Pages.Count()}");
            log.LogInformation($"directory Count: {ctx.Directories.Count()}");
            log.LogInformation($"group Count: {ctx.Groups.Count()}");
            log.LogInformation($"member Count: {ctx.Members.Count()}");
        }
        private void NormalizeUserRecords(ApplicationDbContext appDb)
        {
            // add to roles??
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
