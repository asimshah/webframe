using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core;
using Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.IdentityData2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Fastnet.Webframe.Web2.Controllers
{
    [Produces("application/json")]
    [Route("content")]
    [Authorize(Roles = "Administrators, Editors")]
    public class ContentController : BaseController
    {
        private readonly CoreDataContext coreDataContext;
        public ContentController(ILogger logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager,
            CoreDataContext coreDataContext) : base(logger, env, userManager)
        {
            this.coreDataContext = coreDataContext;
        }

        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpGet("get/directories/{id?}")]
        public async Task<IActionResult> GetDirectories(long? id = null)
        {
            try
            {
                if (!id.HasValue)
                {
                    var rd = await coreDataContext.Directories.SingleAsync(d => d.ParentDirectory == null);
                    var data = new List<DirectoryDTO>();
                    data.Add(new DirectoryDTO { Id = rd.DirectoryId, Name = "Store", SubdirectoryCount = rd.SubDirectories.Count });
                    return SuccessResult(data);
                }
                var directories = coreDataContext.Directories.Where(d => d.ParentDirectory.DirectoryId == id.Value)
                    .OrderBy(x => x.Name)
                    .Select(x => new DirectoryDTO { Id = x.DirectoryId, Name = x.Name, SubdirectoryCount = x.SubDirectories.Count() });
                return SuccessResult(directories);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
    }
}