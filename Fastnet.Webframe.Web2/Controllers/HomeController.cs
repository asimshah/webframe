using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Fastnet.Webframe.CoreData2;
using Microsoft.Extensions.Options;
using Fastnet.Webframe.Common2;
using Microsoft.AspNetCore.Identity;
using Fastnet.Webframe.IdentityData2;
using Microsoft.AspNetCore.Hosting;
using Fastnet.Webframe.Web2.Models.HomeViewModels;

namespace Fastnet.Webframe.Web2.Controllers
{
    public class HomeController : BaseController
    {

        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly ILogger log;
        //private readonly CoreDataContext coreDataContext;
        private readonly WebframeOptions webframeOptions;
        private readonly CustomisationOptions customisationOptions;
        private readonly ContentAssistant contentAssistant;
        public HomeController(ILogger<HomeController> logger, ContentAssistant ca,
            IOptions<WebframeOptions> webframeOptions, IOptions<CustomisationOptions> customisation, SignInManager<ApplicationUser> signInManager,
            IHostingEnvironment environment, UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext) : base(logger, environment, userManager, coreDataContext)
        {
            this.signInManager = signInManager;
            this.contentAssistant = ca;
            this.log = logger;
            this.webframeOptions = webframeOptions.Value;
            this.customisationOptions = customisation.Value;
        }
        //[Route("page/{id}")]
        //[Route("$home")]
        //[Route("home")]
        //[Route("")]
        public IActionResult Index(string id = null)
        {
            //var name = this.User.Identity.Name;
            log.LogInformation($"Index({id})");
            //var memberCount = coreDataContext.Members.Where(x => !x.IsAnonymous).Count();
            ////log.LogInformation($"member count is {memberCount}");
            //if (memberCount == 0)
            //{
            //    // I assume that we are here because this a is a brand new database that has no Administrator
            //    // account. Nothing will work until the Administrator account is set up
            //    return RedirectToAction("CreateAdministrator");
            //}
            //if (!IsAuthenticated && webframeOptions.AutologinAdmin == true)
            //{
            //    var admin = coreDataContext.Members.Single(m => m.IsAdministrator);
            //    var user = await userManager.FindByIdAsync(admin.Id);
            //    await signInManager.SignInAsync(user, false/*, false*/);
            //    admin.LastLoginDate = DateTime.UtcNow;
            //    //Session["current-member"] = admin.Id;
            //    await coreDataContext.SaveChangesAsync();
            //    return RedirectToAction("Index");
            //}
            //Page page = null;
            //if(id != null)
            //{
            //    long pageId = Convert.ToInt64(id);
            //    page = coreDataContext.Pages.SingleOrDefault(p => p.PageId == pageId);
            //}
            //else
            //{

            //    page = contentAssistant.FindLandingPage(GetCurrentMember());
            //}
            //SetCurrentPage(page);
            var model = new StartupViewModel
            {
                ClientCustomisation = this.customisationOptions.GetClientCustomisation()
            };
            return View(model);
        }
        //[Route("permissiondenied/{message?}")]
        //public ActionResult PermissionDenied(string message)
        //{
        //    ViewBag.Message = message;
        //    return View();
        //}
        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
        public IActionResult AccessFailed()
        {
            return View();
        }

    }
}
