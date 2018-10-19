using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.Web2.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public static class _extensions
    {
        public static ClientCustomisation GetClientCustomisation(this CustomisationOptions customisationOptions)
        {
            var cc = new ClientCustomisation();
            switch (customisationOptions.Factory)
            {
                case FactoryName.None:
                    break;
                case FactoryName.DonWhillansHut:
                    cc.factory = FactoryName.DonWhillansHut;
                    List<RouteRedirection> rds = new List<RouteRedirection>();
                    rds.Add(new RouteRedirection { fromRoute = "membership", toRoute = "dwhmembership" });
                    rds.Add(new RouteRedirection { fromRoute = "register", toRoute = "dwhregister" });
                    cc.routeRedirections = rds;
                    break;
            }
            return cc;
        }
    }
    public static class WebExtensions
    {
        public static void AddWebframeServices(this IServiceCollection services)
        {
            var provider = services.BuildServiceProvider();
            var config = provider.GetRequiredService<IConfiguration>();
            services.Configure<CoreDataDbOptions>(config.GetSection("CoreDataDbOptions"));
            services.Configure<MailOptions>(config.GetSection("MailOptions"));
            services.AddWebDbContext<CoreDataContext, CoreDataDbContextFactory, CoreDataDbOptions>(config, "CoreDataDbOptions");
            services.AddTransient<ContentAssistant>();
            services.AddTransient<MailHelper>();
            var customisation = provider.GetService<IOptions<CustomisationOptions>>();
            switch(customisation.Value.Factory)
            {
                case FactoryName.DonWhillansHut:
                    services.Configure<BookingDbOptions>(config.GetSection("BookingDbOptions"));
                    services.AddWebDbContext<BookingDataContext, BookingDbContextFactory, BookingDbOptions>(config, "BookingDbOptions");
                    //services.AddDbContext<BookingDataContext>(o => o.UseSqlServer(config.GetConnectionString("DefaultConnection")));
                    services.AddTransient<IMemberFactory, DWHMemberFactory>();
                    services.AddTransient<BMCApiClient, BMCApiClient>();
                    break;
                default:
                    services.AddTransient<IMemberFactory, MemberFactory>();
                    break;
            }
        }
    }
}
