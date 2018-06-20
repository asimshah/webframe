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
    public class BaseController : Fastnet.Core.Web.Controllers.BaseController
    {
        protected readonly UserManager<ApplicationUser> userManager;
        protected readonly CoreDataContext coreDataContext;
        public BaseController(ILogger logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext) : base(logger, env)
        {
            this.userManager = userManager;
            this.coreDataContext = coreDataContext;
        }
        //public bool IsAuthenticated
        //{
        //    get
        //    {
        //        return User.Identity.IsAuthenticated;
        //    }
        //}
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
        //public IActionResult CacheableSuccessResult(object data, params object[] args)
        //{
        //    var newEtag = CreateEtag(args);
        //    var ifNoneMatch = Request.GetTypedHeaders().IfNoneMatch;
        //    var receivedETag = ifNoneMatch?.FirstOrDefault()?.Tag.Value;

        //    if (receivedETag == newEtag)
        //    {
        //        return StatusCode(StatusCodes.Status304NotModified);
        //    }
        //    Response.GetTypedHeaders().CacheControl = new CacheControlHeaderValue()
        //    {
        //        Public = true
        //    };
        //    Response.GetTypedHeaders().ETag = new EntityTagHeaderValue(newEtag);
        //    return SuccessResult(data);
        //}
        //private string CreateEtag(params object[] args)
        //{
        //    string t = string.Empty;// string.Format("{0:x}", modified.GetHashCode());// "";
        //    foreach (object arg in args)
        //    {
        //        if (arg != null)
        //        {
        //            t += string.Format("{0:x}", arg.GetHashCode());
        //        }
        //    }
        //    string etag = "\"" + t + "\"";
        //    return etag;
        //}
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
        }
    }
}
