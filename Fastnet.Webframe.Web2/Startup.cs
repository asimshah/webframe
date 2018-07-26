using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.IdentityData2;
using Fastnet.Webframe.Web2.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
//using Fastnet.Webframe.Web2.Common;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.AspNetCore.Hosting.Internal.HostingApplication;

namespace Fastnet.Webframe.Web2
{
    public class Startup
    {
        private const string SecretKey = "4B6ECC1C-D676-4132-9FC6-04AF278A3937"; // todo: get this from somewhere secure
        private readonly string version;
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
            //var version = Microsoft.Extensions.PlatformAbstractions.PlatformServices.Default.Application.ApplicationVersion;
            version = typeof(Startup).GetTypeInfo().Assembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
            log.LogInformation($"Webframe Site {version} started");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddResponseCaching();
            services.AddSession();
            services.AddOptions();
            //services.Configure<WebframeOptions>(Configuration.GetSection("WebframeOptions"));
            services.Configure<CustomisationOptions>(Configuration.GetSection("CustomisationOptions"));

            var provider = services.BuildServiceProvider();
            var customisation = provider.GetService<IOptions<CustomisationOptions>>().Value;

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(Configuration.GetConnectionString("IdentityConnection"));
            });

            services.AddWebframeServices();


            services.AddIdentity<ApplicationUser, IdentityRole>((options) =>
            {
                options.Password.RequiredLength = customisation.PasswordMinimumLength;// 8;
                options.Password.RequireLowercase = customisation.PasswordRequireLowercase;// false;
                options.Password.RequireUppercase = customisation.PasswordRequireUppercase;// true;
                options.Password.RequireNonAlphanumeric = customisation.PasswordRequireNonAlphanumeric;// false;
                options.Password.RequireDigit = customisation.PasswordRequireDigit;//
                options.User.RequireUniqueEmail = true;
            })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.Expiration = TimeSpan.FromMinutes(30);
                //*NB* so that users always see the access denied page if they are required to be authenticated
                // in practice, such access is caught in angular routeguard
                options.LoginPath = "/Home/AccessDenied";// "/login";               
                options.AccessDeniedPath = "/Home/AccessDenied";
                options.SlidingExpiration = true;
                options.Events = new CookieAuthenticationEvents
                {
                    OnRedirectToLogin = c => { return CheckForUnauthorized(c); },
                    OnRedirectToAccessDenied = c => { return CheckForUnauthorized(c); }
                    //OnRedirectToLogout = c =>
                    //{
                    //    log.Debug($"OnRedirectToLogout");
                    //    return Task.CompletedTask;
                    //},
                    //OnSignedIn = c =>
                    //{
                    //    log.Information($"{c.Principal.Identity.Name} logged in");
                    //    return Task.CompletedTask;
                    //},
                    //OnSigningOut = c =>
                    //{
                    //    log.Information($"{c.HttpContext.User.Identity.Name} logged out");
                    //    return Task.CompletedTask;
                    //},
                    //OnRedirectToReturnUrl = c =>
                    //{
                    //    log.Debug($"OnRedirectToReturnUrl");
                    //    return Task.CompletedTask;
                    //},
                    //OnSigningIn = c =>
                    //{
                    //    log.Debug($"OnSigningIn");
                    //    return Task.CompletedTask;
                    //},
                    //OnValidatePrincipal = c =>
                    //{
                    //    log.Debug($"OnSigningIn");
                    //    return Task.CompletedTask;
                    //}
                };
            });

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<IEmailSender, EmailSender>();



            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IOptions<CustomisationOptions> options,
            IServiceProvider serviceProvider,
            ApplicationDbContext appDb, CoreDataContext coreDataContext, BookingDataContext bookingDb)
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
            app.UseSession();

            app.UseResponseCaching();

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
            using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                try
                {
                    var db = scope.ServiceProvider.GetService<CoreDataContext>();
                    var log = scope.ServiceProvider.GetService<ILogger<CoreDataDbInitialiser>>();
                    CoreDataDbInitialiser.Initialise(db, log, hostingEnvironment);
                    var aa = new ApplicationAction { Version = version, Remark = $"Webframe startup, machine {Environment.MachineName}, process {System.Diagnostics.Process.GetCurrentProcess().Id}" };
                    db.Actions.Add(aa);
                    db.SaveChanges();
                }
                catch (Exception xe)
                {
                    log.Error(xe, "Error initialising CoreDataContext");
                }
            }
            if (appDb.Users.ToArray().Count(x => string.IsNullOrWhiteSpace(x.NormalizedUserName)) > 0)
            {
                log.LogInformation($"Application db user records need normalisation");
                NormalizeUserRecords(appDb);

                log.LogInformation($"Application db user records normalised");
            }
            CreateRolesForUsers(coreDataContext, serviceProvider);
            if (options.Value.Factory == FactoryName.DonWhillansHut)
            {
                DWHMember.ResetAnonymous(coreDataContext);
                //DebugSomeBookingDataStats(bookingDataContext);
            }
            DebugSomeCoreDataStats(coreDataContext, options.Value);
            if (options.Value.bookingApp.enabled)
            {
                DebugSomeBookingDataStats(bookingDb);
            }
        }

        private void CreateRolesForUsers(CoreDataContext coreDataContext, IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var groups = coreDataContext.Groups.Include(x => x.GroupMembers)
                .ThenInclude(x => x.Member)
                .ToArray();
            foreach (var group in groups)
            {
                if (!group.Type.HasFlag(GroupTypes.SystemDefinedMembers))
                {
                    var members = group.GroupMembers.Select(x => x.Member);
                    if (!roleManager.RoleExistsAsync(group.Name).Result)
                    {
                        var role = new IdentityRole(group.Name);
                        var roleResult = roleManager.CreateAsync(role).Result;
                        if (!roleResult.Succeeded)
                        {
                            foreach (var error in roleResult.Errors)
                            {
                                log.LogError($"{error.Description}");
                            }
                        }
                        else
                        {
                            log.LogInformation($"Role {group.Name} created");
                        }
                    }
                    foreach (var m in members)
                    {
                        var user = userManager.FindByIdAsync(m.Id).Result;
                        if (!userManager.IsInRoleAsync(user, group.Name).Result)
                        {
                            var x = userManager.AddToRoleAsync(user, group.Name).Result;
                            log.LogInformation($"{user.Email} added to role {group.Name}");
                        }
                    }
                }
            }
        }
        private Task CheckForUnauthorized(RedirectContext<CookieAuthenticationOptions> ctx)
        {
            if (ctx.Request.Path.StartsWithSegments("/membershipapi") &&
                ctx.Response.StatusCode == (int)HttpStatusCode.OK)
            {
                ctx.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            }
            return Task.CompletedTask;
        }
        private void DebugSomeBookingDataStats(BookingDataContext ctx)
        {
            log.Information($"booking Count: {ctx.Bookings.Count()}");
            log.Information($"emails Count: {ctx.Emails.Count()}");
            log.Information($"entry code Count: {ctx.EntryCodes.Count()}");
            log.Information($"accomodation count: {ctx.AccomodationSet.Count()}");
            log.Information($"availability count: {ctx.Availabilities.Count()}");
            log.Information($"email template count: {ctx.EmailTemplates.Count()}");
            log.Information($"parameter count: {ctx.DWHParameters.Count()}");
            log.Information($"period count: {ctx.Periods.Count()}");
            log.Information($"prices count: {ctx.Prices.Count()}");
        }

        private void DebugSomeCoreDataStats(CoreDataContext ctx, CustomisationOptions options)
        {
            log.Information($"page Count: {ctx.Pages.Count()}");
            log.Information($"directory Count: {ctx.Directories.Count()}");
            log.Information($"group Count: {ctx.Groups.Count()}");
            log.Information($"member Count: {ctx.Members.Count()}");
            var members = options.Factory == FactoryName.DonWhillansHut ? ctx.DWHMembers as IEnumerable<Member> : ctx.Members;
            //foreach(var member in members.OrderBy(m => m.LastName).ThenBy(m => m.FirstName))
            //{
            //    log.LogInformation($"member: {member.FirstName}, {member.LastName}, {member.EmailAddress}");
            //}
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
