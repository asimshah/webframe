using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Fastnet.Webframe.IdentityData2;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Fastnet.Webframe.Web2.Controllers
{
    [Authorize]
    [Route("pageapi")]
    public class PageController : Controller
    {
        private readonly ILogger log;
        private readonly UserManager<ApplicationUser> userManager;
        public PageController(ILogger<PageController> logger, UserManager<ApplicationUser> userManager)
        {
            this.log = logger;
            this.userManager = userManager;
        }
        [HttpGet("logaction")]
        public IActionResult LogAction()
        {
            log.LogInformation($"LogAction() called, with this.HttpContext.User.Identity.IsAuthenticated {this.HttpContext.User.Identity.IsAuthenticated}");
            return new ObjectResult(null);
        }
    }
}
