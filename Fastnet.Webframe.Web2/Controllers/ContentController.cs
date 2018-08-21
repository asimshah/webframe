using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core;
using Fastnet.Core.Web;
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
        public ContentController(ILogger<ContentController> logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager,
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
                    .ToArray()
                    .Select(x => x.ToDTO());
                    //.Select(x => new DirectoryDTO { Id = x.DirectoryId, Name = x.Name, ParentId = x.ParentDirectoryId, SubdirectoryCount = x.SubDirectories.Count() });
                return SuccessResult(directories);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpGet("get/files/{id}")]
        public async Task<IActionResult> GetDirectoryContent(long id)
        {
            var directory = await coreDataContext.Directories.FindAsync(id);
            if (directory != null)
            {
                var dto = new ContentDTO
                {
                    Pages = directory.Pages.ToArray().Select(p => p.ToDTO()).ToArray(),
                    Documents = directory.Documents.ToArray().Select(d => d.ToDTO()).ToArray(),
                    Images = directory.Images.ToArray().Select(x => x.ToDTO()).ToArray()
                };
                //var pages = directory.Pages.ToArray();
                //var documents = directory.Documents.ToArray();
                //var images = directory.Images.ToArray();
                //log.Information($"Directory {directory.Name}, {pages.Count()} pages, {documents.Count()} documents, {images.Count()} images");
                return SuccessResult(dto);
            }
            else
            {
                return ExceptionResult(new Exception($"Directory id {id} not found"));
            }
        }
        [HttpPost("create/directory")]
        public async Task<IActionResult> CreateDirectory()
        {
            try
            {
                var dto = Request.FromBody<DirectoryDTO>();
                if (dto.ParentId.HasValue)
                {
                    var parent = await coreDataContext.Directories.FindAsync(dto.ParentId.Value);
                    var existingNames = parent.SubDirectories.Select(x => x.Name.ToLower());
                    if (!existingNames.Contains(dto.Name, StringComparer.CurrentCultureIgnoreCase))
                    {
                        var dir = new Directory
                        {
                            ParentDirectory = parent,
                            Name = dto.Name
                        };
                        await coreDataContext.Directories.AddAsync(dir);
                        await coreDataContext.RecordChanges(dir, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.NewFolder);
                        await coreDataContext.SaveChangesAsync();
                        return SuccessResult(dir.ToDTO());
                    }
                    else
                    {
                        return ErrorResult($"A directory called {dto.Name} already exists");
                    }
                }
                else
                {
                    return ExceptionResult(new Exception("Parent Directory not specified"));
                }
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("delete/directory/{id}")]
        public async Task<IActionResult> DeleteDirectory(long id)
        {
            try
            {
                var dir = await coreDataContext.Directories.FindAsync(id);
                if (dir != null && dir.ParentDirectory != null)
                {
                    await DeleteDirectory(dir);
                    await coreDataContext.SaveChangesAsync();
                    return SuccessResult();
                }
                else
                {
                    return ExceptionResult(new Exception("Invalid directory key"));
                }
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        private async Task DeleteDirectory(Directory dir)
        {
            foreach(var sd in dir.SubDirectories.ToArray())
            {
                await DeleteDirectory(sd);
            }
            foreach(var page in dir.Pages.ToArray())
            {
                await DeletePage(page, dir);
            }
            foreach (var doc in dir.Documents.ToArray())
            {
                await DeleteDocument(doc, dir);
            }
            foreach (var image in dir.Images.ToArray())
            {
                await DeleteImage(image, dir);
            }
            coreDataContext.Directories.Remove(dir);
            await coreDataContext.RecordChanges(dir, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.FolderDeleted);
        }
        private async Task DeletePage(Page page, Directory container)
        {
            var pm = page.PageMarkup;
            coreDataContext.PageMarkups.Remove(pm);
            coreDataContext.Pages.Remove(page);
            await coreDataContext.RecordChanges(page, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.PageDeleted, container);
        }
        private async Task DeleteDocument(Document doc, Directory container)
        {
            var pageDocs = doc.PageDocuments.ToArray();
            coreDataContext.PageDocuments.RemoveRange(pageDocs);
            coreDataContext.Documents.Remove(doc);
            await coreDataContext.RecordChanges(doc, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.DocumentDeleted, container);
        }
        private async Task DeleteImage(Image image, Directory container)
        {
            coreDataContext.Images.Remove(image);
            await coreDataContext.RecordChanges(image, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.ImageDeleted, container);
        }
    }
}