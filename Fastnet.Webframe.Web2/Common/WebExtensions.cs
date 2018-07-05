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
            services.AddDbContext<CoreDataContext>(options => options.UseSqlServer(config.GetConnectionString("DefaultConnection")));
            services.AddTransient<ContentAssistant>();
            var customisation = provider.GetService<IOptions<CustomisationOptions>>();
            switch(customisation.Value.Factory)
            {
                case FactoryName.DonWhillansHut:
                    services.AddDbContext<BookingDataContext>(o => o.UseSqlServer(config.GetConnectionString("DefaultConnection")));
                    services.AddTransient<IMemberFactory, DWHMemberFactory>();
                    //services.AddTransient<IMembershipControllerHelper, DWHMembershipControllerHelper>();
                    break;
                default:
                    services.AddTransient<IMemberFactory, MemberFactory>();
                    //services.AddTransient<IMembershipControllerHelper, MembershipControllerHelper>();
                    break;
            }
        }
    }
}
