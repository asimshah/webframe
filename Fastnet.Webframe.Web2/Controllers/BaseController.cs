using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Fastnet.Webframe.CoreData2;
using Microsoft.AspNetCore.Identity;
using Fastnet.Webframe.IdentityData2;
using Microsoft.AspNetCore.Hosting;
using Fastnet.Core.Web.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using Microsoft.Extensions.Logging;

namespace Fastnet.Webframe.Web2.Controllers
{
    public abstract class BaseController : Fastnet.Core.Web.Controllers.BaseController
    {
        protected readonly UserManager<ApplicationUser> userManager;
        private CoreDataContext db_ctx;
        protected abstract CoreDataContext GetCoreDataContext();
        public BaseController(ILogger logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager/*, CoreDataContext coreDataContext*/) : base(logger, env)
        {
            this.userManager = userManager;
            
            //this.coreDataContext = coreDataContext;
        }
        public Member GetCurrentMember()
        {
            this.db_ctx = GetCoreDataContext();
            if(IsAuthenticated)
            {
                var id = userManager.GetUserId(User);
                return db_ctx.Members.Single(x => x.Id == id);
            }
            else
            {
                return db_ctx.GetAnonymousMember();
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
        }
        private Page GetPage()
        {
            this.db_ctx = GetCoreDataContext();
            // store the id not the object so that we are syncornised with
            // the current datacontext
            var session = HttpContext.Session;
            if(session.TryGetValue("current-page", out byte[] bytes))
            {
                long id = BitConverter.ToInt64(bytes, 0);
                return db_ctx.Pages.Single(p => p.PageId == id);
            }
            return null;
        }
    }
}
