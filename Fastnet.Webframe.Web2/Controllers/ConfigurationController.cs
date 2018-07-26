using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.IdentityData2;
using Microsoft.AspNetCore.Identity;
using Fastnet.Webframe.Common2;
using Microsoft.Extensions.Options;
using Fastnet.Core.Web;
using Fastnet.Core;

namespace Fastnet.Webframe.Web2.Controllers
{
    //[Produces("application/json")]
    [Route("configapi")]
    public class ConfigurationController : BaseController
    {
        private readonly CustomisationOptions customisationOptions;
        //private readonly ILogger log;
        private readonly CoreDataContext coreDataContext;
        public ConfigurationController(ILogger<ConfigurationController> logger, IOptions<CustomisationOptions> customOptions, IHostingEnvironment environment, UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext) : base(logger, environment, userManager/*, coreDataContext*/)
        {
            //this.log = logger;
            this.coreDataContext = coreDataContext;
            this.customisationOptions = customOptions.Value;
        }
        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpPost("post/ci")]
        public async Task<IActionResult> ClientInformation()
        {
            var bi = this.Request.FromBody<browserInfo>();
            log.Information($"browser is {bi.Name}, {bi.Version}");
            var id = this.HttpContext.Session.GetString("SessionId");
            if (string.IsNullOrWhiteSpace(id))
            {
                //var userAgent = context.Request.UserAgent();
                //var ctx = cdbContextFactory.GetWebDbContext<CoreDataContext>();
                var sa = new SessionAction
                {
                    SessionId = HttpContext.Session.Id,
                    IpAddress = HttpContext.GetRemoteIPAddress(),
                    Browser = bi.Name,// HttpContext.Request.GetBrowser().ToString(),
                    Version = bi.Version
                };
                await coreDataContext.Actions.AddAsync(sa);
                await coreDataContext.SaveChangesAsync();
                //var t = ctx.Actions.Count();
                //log.Information($"action count is {t}");
                //Debugger.Break();
                HttpContext.Session.SetString("SessionId", HttpContext.Session.Id);
                log.Information($"New session {HttpContext.Session.Id} started from {sa.IpAddress} using {sa.Browser}, {sa.Version}");
            }
            return SuccessDataResult(null);
        }
        //[HttpGet("get/configuration")]
        //public IActionResult GetConfiguration()
        //{
        //    return SuccessDataResult(this.customisationOptions.GetClientCustomisation());
        //    //var cc = new ClientCustomisation();
        //    //switch(this.customisationOptions.Factory)
        //    //{
        //    //    case FactoryName.None:
        //    //        break;
        //    //    case FactoryName.DonWhillansHut:
        //    //        cc.Factory = FactoryName.DonWhillansHut;
        //    //        List<RouteRedirection> rds = new List<RouteRedirection>();
        //    //        rds.Add(new RouteRedirection { FromRoute = "membership", ToRoute = "dwhmembership" });
        //    //        cc.RouteRedirections = rds;
        //    //        break;
        //    //}
        //    //return SuccessDataResult(cc);
        //}
    }
    public class browserInfo
    {
        public class osInfo
        {
            public string Family { get; set; }
            public string Version { get; set; }
        }
        public string Name { get; set; }
        public string Version { get; set; }
        public osInfo OS { get; set; }
    }
}