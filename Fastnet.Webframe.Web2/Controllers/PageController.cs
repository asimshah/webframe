using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Fastnet.Webframe.IdentityData2;
using Fastnet.Webframe.CoreData2;
using Microsoft.AspNetCore.Hosting;
using Fastnet.Core.Web.Controllers;
using System.IO;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Fastnet.Webframe.Web2.Controllers
{
    //[Authorize]
    [Route("pageapi")]
    public class PageController : BaseController
    {
        //private readonly ILogger log;
        private readonly ContentAssistant contentAssistant;
        private readonly IHostingEnvironment environment;
        private readonly CoreDataContext coreDataContext;
        public PageController(ILogger<PageController> logger, ContentAssistant contentAssistant,
            IHostingEnvironment environment, UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext) : base(logger, environment, userManager/*, coreDataContext*/)
        {
            //this.log = logger;
            this.coreDataContext = coreDataContext;
            this.environment = environment;
            this.contentAssistant = contentAssistant;
            coreDataContext.ChangeTracker.AutoDetectChangesEnabled = false;

        }
        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpGet("get/page/{id}")]
        public async Task<IActionResult> GetPage(long id)
        {
            Stopwatch sw = new Stopwatch();
            sw.Start();
            var m = GetCurrentMember();
            Page page = await coreDataContext.Pages.Include(x => x.PageMarkup).SingleOrDefaultAsync(x => x.PageId == id);
            //log.LogInformation($"get/page/{id} in {sw.ElapsedMilliseconds} ms (after read)");
            if (page != null)
            {
                var etagStatus = IsEtagUnchanged(page.PageMarkup.LastModifiedOn, m.Id);
                PageHtmlInformation info = null;
                if (!etagStatus.IsUnchanged)
                {
                    AccessResult ar = await contentAssistant.GetAccessResultAsync(m, page);
                    //log.LogInformation($"get/page/{id} in {sw.ElapsedMilliseconds} ms (after access check)");
                    if (ar == AccessResult.Rejected)
                    {
                        return ErrorDataResult("AccessDenied");
                    }
                    //PageHtmlInformation info = null;
                    if (page.MarkupType == MarkupType.DocX)
                    {
                        info = await contentAssistant.PrepareDocXPage(page);
                    }
                    else if (page.MarkupType == MarkupType.Html)
                    {
                        info = await contentAssistant.PrepareHTMLPage(page);
                    }
                    log.LogInformation($"get/page/{id} in {sw.ElapsedMilliseconds} ms");
                }
                return CacheableSuccessDataResult(info, page.PageMarkup.LastModifiedOn, m.Id);
            }
            else
            {
                return ErrorDataResult("PageNotFound");
            }
        }
        [HttpGet("get/default/banner/pageId")]
        public async Task<IActionResult> GetDefaultBannerPage()
        {
            var page = await contentAssistant.FindDefaultBannerPage();            
            if(page != null)
            {
                return SuccessDataResult(page.PageId);
            }
            else
            {
                return ErrorDataResult("PageNotFound");
            }
        }
        [HttpGet("get/pagekeys/{centrePageId?}")]
        public async Task<IActionResult> GetPageKeys(long? centrePageId = null)
        {
            Member m = GetCurrentMember();
            Page page;
            if (!centrePageId.HasValue)
            {
                // request is for current user's landing pages
                page = await contentAssistant.FindLandingPageAsync(m);
            }
            else
            {
                page = await coreDataContext.Pages.FindAsync(centrePageId);

            }
            if (page == null)
            {
                return ErrorDataResult("PageNotFound");
            }
            var result = await contentAssistant.GetPageKeys(page);
            return SuccessDataResult(result);
        }
        [HttpGet("~/image/{id}")]
        public async Task<IActionResult> GetImage(long id)
        {
            Image image = await coreDataContext.Images.FindAsync(id);
            MemoryStream ms = new MemoryStream(image.Data);
            var r = File(ms, image.MimeType);
            return CacheableResult(r, image.CreatedOn);
            //return CacheableSuccessResult(r, image.CreatedOn);
            //HttpResponseMessage response = this.Request.CreateResponse(HttpStatusCode.OK);
            //response.Content = new StreamContent(ms);
            //response.Content.Headers.ContentType = new MediaTypeHeaderValue(image.MimeType);
            //CacheControlHeaderValue cchv = new CacheControlHeaderValue { Public = true, MaxAge = TimeSpan.FromDays(30) };
            //response.Headers.CacheControl = cchv;
            //return response;
        }
        [HttpGet("get/menus")]
        public async Task<IActionResult> GetMenus()
        {
            // entity MenuMaster is ignored. q.v. MenuMaster in CoreData
            //if (IsAuthenticated)
            //{
            //    var m = GetCurrentMember();
            //    var user = await userManager.GetUserAsync(User);
            //    log.LogInformation($"GetCurrentMember() returns {m.Fullname}, userManager returns {user.UserName}");
            //}
            List<MenuDetails> menuList = new List<MenuDetails>();
            long? parentMenuId = null;
            List<object> etagParams = new List<object>();
            await LoadMenusForParent(menuList, parentMenuId, 0, etagParams);
            return CacheableSuccessDataResult(menuList, this.GetCurrentMember().Id, etagParams);
            //return SuccessDataResult(menuList);
        }

        [HttpGet("logaction")]
        public IActionResult LogAction()
        {
            log.LogInformation($"LogAction() called, with this.HttpContext.User.Identity.IsAuthenticated {this.HttpContext.User.Identity.IsAuthenticated}");
            return new ObjectResult(null);
        }
        [HttpGet("test/group/{id}")]
        public async Task<IActionResult> TestGroupChildren(long id)
        {
            coreDataContext.ChangeTracker.AutoDetectChangesEnabled = false;
            var group = await coreDataContext.Groups.FindAsync(id);
            //var r = group.AreChildrenPresent();
            //log.LogInformation($"{group.Name} [{group.GroupId}] children present = {r} ...");
            await coreDataContext.LoadGroupChildren(group);
            //r = group.AreChildrenPresent();
            log.LogInformation($"{group.Name} [{group.GroupId}] {group.Children?.Count()} children");
            return new EmptyResult();
        }
        [HttpGet("test/dir/{id}")]
        public async Task<IActionResult> TestDirectoryGroups(long id)
        {
            coreDataContext.ChangeTracker.AutoDetectChangesEnabled = false;
            var dir = await coreDataContext.Directories.FindAsync(id);
            try
            {
                var groups = dir.Groups;
                log.LogInformation($"{dir.FullName} [{dir.DirectoryId}] has {groups.Count()} groups");
            }
            catch (Exception xe)
            {
                log.LogError($"{dir.FullName} [{dir.DirectoryId}] exception; { xe.Message}");
            }
            await coreDataContext.LoadGroups(dir);
            try
            {
                var groups = dir.Groups;
                log.LogInformation($"{dir.FullName} [{dir.DirectoryId}] has {groups.Count()} groups");
            }
            catch (Exception xe)
            {
                log.LogError($"{dir.FullName} [{dir.DirectoryId}] exception; { xe.Message}");
            }
            await coreDataContext.LoadParentsAsync(dir);
            while (dir.ParentDirectory != null)
            {
                log.LogInformation($"{dir.Name} [{dir.DirectoryId}] parent is {dir.ParentDirectory.Name} [{dir.ParentDirectory.DirectoryId}]");
                dir = dir.ParentDirectory;
            }
            return new EmptyResult();
        }
        [HttpGet("test/access/{memberId}")]
        public async Task<IActionResult> TestAccess(string memberId)
        {
            coreDataContext.ChangeTracker.AutoDetectChangesEnabled = false;
            var member = await coreDataContext.Members.FindAsync(memberId);
            //var directories = await coreDataContext.Directories.ToArrayAsync();
            var pages = await coreDataContext.Pages.ToArrayAsync();
            var documents = await coreDataContext.Documents.ToArrayAsync();
            var images = await coreDataContext.Images.ToArrayAsync();
            //foreach(var dir in directories)
            //{
            //    var result = await contentAssistant.GetAccessResultAsync(member, dir);
            //    log.LogInformation($"{dir.FullName} [{dir.DirectoryId}] result is {result.ToString()}");
            //}
            foreach (var page in pages)
            {
                var result = await contentAssistant.GetAccessResultAsync(member, page);
                log.LogInformation($"{page.Name} [{page.PageId}] result is {result.ToString()}");
            }
            foreach (var doc in documents)
            {
                var result = await contentAssistant.GetAccessResultAsync(member, doc);
                log.LogInformation($"{doc.Name} [{doc.DocumentId}] result is {result.ToString()}");
            }
            foreach (var image in images)
            {
                var result = await contentAssistant.GetAccessResultAsync(member, image);
                log.LogInformation($"{image.Name} [{image.ImageId}] result is {result.ToString()}");
            }
            return new EmptyResult();
        }

        private async Task LoadMenusForParent(List<MenuDetails> menuList, long? parentMenuId, int level, List<object> etagParams)
        {
            bool canAccessLoginOut(string loweredurl)
            {
                var m = GetCurrentMember();
                if (loweredurl == "login")
                {
                    var anonymous = coreDataContext.GetSystemGroup(SystemGroups.Anonymous);
                    return contentAssistant.IsMemberOf(m, anonymous);
                }
                if (loweredurl == "logout")
                {
                    var allMembers = coreDataContext.GetSystemGroup(SystemGroups.AllMembers);
                    return contentAssistant.IsMemberOf(m, allMembers);
                }
                return false;
            }
            bool canAccessBuiltinApps(string loweredurl)
            {
                bool result = false;
                var m = GetCurrentMember();
                switch (loweredurl)
                {
                    case "cms":
                    case "membership":
                        var admins = coreDataContext.GetSystemGroup(SystemGroups.Administrators);
                        result = contentAssistant.IsMemberOf(m, admins);
                        break;
                        //return Group.Administrators.Members.Contains(m);
                    case "designer":
                        var designers = coreDataContext.GetSystemGroup(SystemGroups.Designers);
                        result = contentAssistant.IsMemberOf(m, designers);
                        break;
                }
                return result;
            }
            bool canAccess(Menu m)
            {
                bool result = false;
                if(m.Url == null)
                {
                    result = true;
                }
                else
                {
                    var loweredUrl = m.Url.ToLower();
                    if(loweredUrl.StartsWith("/"))
                    {
                        loweredUrl = loweredUrl.Substring(1);
                    }
                    switch(loweredUrl)
                    {
                        default:
                            result = true;
                            break;
                        case "cms":
                        case "designer":
                        case "membership":
                            return canAccessBuiltinApps(loweredUrl);
                        case "login":
                        case "logout":
                            return canAccessLoginOut(loweredUrl);
                    }
                }
                return result;

            }
            var menus = await coreDataContext.Menus.Include(x => x.Submenus)
                .Where(x => x.ParentMenu_Id == parentMenuId)
                .OrderBy(x => x.Index)
                .ToArrayAsync();
            foreach (var m in menus)
            {
                if (canAccess(m))
                {
                    var md = new MenuDetails
                    {
                        Level = level,
                        Index = m.Index,
                        Text = m.Text,
                        Url = m.Url,
                        SubMenus = new List<MenuDetails>()
                    };
                    menuList.Add(md);
                    etagParams.Add(level);
                    etagParams.Add(m.Index);
                    etagParams.Add(m.Text);
                    etagParams.Add(m.Url);
                    // add to menu result
                    if (m.Submenus.Count() != 0)
                    {
                        await LoadMenusForParent(md.SubMenus, m.ParentMenu_Id, level + 1, etagParams);
                    }
                }
            }

        }
    }
}
