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

namespace Fastnet.Webframe.Web2.Controllers
{
    public class BaseController : Controller
    {
        protected readonly UserManager<ApplicationUser> userManager;
        protected readonly CoreDataContext coreDataContext;
        public BaseController(UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext)
        {
            this.userManager = userManager;
            this.coreDataContext = coreDataContext;
        }
        public bool IsAuthenticated
        {
            get
            {
                return User.Identity.IsAuthenticated;
            }
        }
        public Member GetCurrentMember()
        {
            if(IsAuthenticated)
            {
                var id = userManager.GetUserId(User);
                return coreDataContext.Members.Single(x => x.Id == id);
            }
            else
            {
                return coreDataContext.GetAnonymousMember();
            }
        }
        public Page GetCurrentPage()
        {
            return GetPage();
        }
        public void SetCurrentPage(Page page)
        {
            this.SetPage(page);
        }            
        private void SetPage(Page page)
        {
            // store the id not the object so that we are syncornised with
            // the current datacontext
            var session = HttpContext.Session;
            session.Set("current-page", BitConverter.GetBytes( (long)page?.PageId));// page == null ? (long?)null : (long?)page.PageId;
            //Debug.Print("Recorded page {0}", page == null ? "null" : page.PageId);
        }
        private Page GetPage()
        {
            
            // store the id not the object so that we are syncornised with
            // the current datacontext
            var session = HttpContext.Session;
            if(session.TryGetValue("current-page", out byte[] bytes))
            {
                long id = BitConverter.ToInt64(bytes, 0);
                return coreDataContext.Pages.Single(p => p.PageId == id);
            }
            return null;
            //long? id = (long?)(session.TryGetValue["current-page"] ?? null);
            //return id.HasValue ? Core.GetDataContext().Pages.Single(m => m.PageId == id.Value) : null;
            //Debug.Print("Recorded member {0}", member.Fullname);
        }
    }
    public class HomeController : BaseController
    {

        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly ILogger log;
        //private readonly CoreDataContext coreDataContext;
        private readonly WebframeOptions webframeOptions;
        private readonly ContentAssistant contentAssistant;
        public HomeController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager,
            ContentAssistant ca,
            ILogger<HomeController> logger, CoreDataContext coreDataContext, IOptions<WebframeOptions> webframeOptions) : base(userManager, coreDataContext)
        {
            this.signInManager = signInManager;
            this.contentAssistant = ca;
            this.log = logger;
            this.webframeOptions = webframeOptions.Value;
        }
        //[Route("page/{id}")]
        //[Route("$home")]
        //[Route("home")]
        //[Route("")]
        public async Task<IActionResult> Index(string id = null)
        {
            //var name = this.User.Identity.Name;
            log.LogInformation($"Index({id})");
            var memberCount = coreDataContext.Members.Where(x => !x.IsAnonymous).Count();
            //log.LogInformation($"member count is {memberCount}");
            if (memberCount == 0)
            {
                // I assume that we are here because this a is a brand new database that has no Administrator
                // account. Nothing will work until the Administrator account is set up
                return RedirectToAction("CreateAdministrator");
            }
            if (!IsAuthenticated && webframeOptions.AutologinAdmin == true)
            {
                var admin = coreDataContext.Members.Single(m => m.IsAdministrator);
                var user = await userManager.FindByIdAsync(admin.Id);
                await signInManager.SignInAsync(user, false/*, false*/);
                admin.LastLoginDate = DateTime.UtcNow;
                //Session["current-member"] = admin.Id;
                await coreDataContext.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            Page page = null;
            if(id != null)
            {
                long pageId = Convert.ToInt64(id);
                page = coreDataContext.Pages.SingleOrDefault(p => p.PageId == pageId);
            }
            else
            {

                page = contentAssistant.FindLandingPage(GetCurrentMember());
            }
            //SetCurrentPage(page);
            return View();
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
