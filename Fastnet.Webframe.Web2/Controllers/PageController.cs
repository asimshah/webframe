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

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Fastnet.Webframe.Web2.Controllers
{
    //[Authorize]
    [Route("pageapi")]
    public class PageController : BaseController
    {
        private readonly ILogger log;
        private readonly ContentAssistant contentAssistant;
        private readonly IHostingEnvironment environment;
        public PageController(IHostingEnvironment environment, ILogger<PageController> logger, UserManager<ApplicationUser> userManager,
            ContentAssistant contentAssistant, CoreDataContext coreDataContext) : base(environment, userManager, coreDataContext)
        {
            this.log = logger;
            this.environment = environment;
            this.contentAssistant = contentAssistant;
        }
        [HttpGet("get/page/{id}")]
        public async Task<IActionResult> GetPage(long id)
        {
            var m = GetCurrentMember();
            Page page = await coreDataContext.Pages.SingleAsync(x => x.PageId == id);
            AccessResult ar = await contentAssistant.GetAccessResultAsync(m, page);
            if (ar == AccessResult.Rejected)
            {
                return ErrorResult("AccessDenied");
            }
            PageHtmlInformation info = null;
            if (page.MarkupType == MarkupType.DocX)
            {
                info = await contentAssistant.PrepareDocXPage(page);
            }
            else if (page.MarkupType == MarkupType.Html)
            {
                info = await contentAssistant.PrepareHTMLPage(page);
            }
            return CacheableSuccessResult(info, page.PageMarkup.LastModifiedOn, m.Id);
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
            var result = await contentAssistant.GetPageKeys(page);
            return new DataResult { Success = true, Data = result };
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
            catch(Exception xe)
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
            while(dir.ParentDirectory != null)
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
    }
}
