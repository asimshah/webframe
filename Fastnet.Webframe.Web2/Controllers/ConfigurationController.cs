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

namespace Fastnet.Webframe.Web2.Controllers
{
    //[Produces("application/json")]
    [Route("configapi")]
    public class ConfigurationController : BaseController
    {
        private readonly CustomisationOptions customisationOptions;
        private readonly ILogger log;
        public ConfigurationController(ILogger<ConfigurationController> logger, IOptions<CustomisationOptions> customOptions, IHostingEnvironment environment, UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext) : base(logger, environment, userManager, coreDataContext)
        {
            this.log = logger;
            this.customisationOptions = customOptions.Value;
        }
        [HttpGet("get/configuration")]
        public IActionResult GetConfiguration()
        {
            return SuccessDataResult(this.customisationOptions.GetClientCustomisation());
            //var cc = new ClientCustomisation();
            //switch(this.customisationOptions.Factory)
            //{
            //    case FactoryName.None:
            //        break;
            //    case FactoryName.DonWhillansHut:
            //        cc.Factory = FactoryName.DonWhillansHut;
            //        List<RouteRedirection> rds = new List<RouteRedirection>();
            //        rds.Add(new RouteRedirection { FromRoute = "membership", ToRoute = "dwhmembership" });
            //        cc.RouteRedirections = rds;
            //        break;
            //}
            //return SuccessDataResult(cc);
        }
    }
}