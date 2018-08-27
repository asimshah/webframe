using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
        private readonly IHostingEnvironment env;
        public ContentController(ILogger<ContentController> logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager,
            CoreDataContext coreDataContext) : base(logger, env, userManager)
        {
            this.coreDataContext = coreDataContext;
            this.env = env;
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
        [HttpPost("create/page")]
        public async Task<IActionResult> CreatePage()
        {
            var dto = Request.FromBody<NewPageDTO>();
            Directory dir = null;
            if(dto.ReferencePageId.HasValue)
            {
                var refPage = await coreDataContext.Pages.FindAsync(dto.ReferencePageId.Value);
                dir = refPage.Directory;
            }
            else
            {
                dir = await coreDataContext.Directories.FindAsync(dto.DirectoryId);
            }
            if(dir != null)
            {
                if (!ItemExists(dir, dto.Name))
                {
                    var page = coreDataContext.CreateNewPage();
                    page.Type = dto.Type;
                    page.Name = dto.Name;
                    page.PageMarkup.CreatedBy = GetCurrentMember().Fullname;
                    page.PageMarkup.CreatedOn = DateTimeOffset.UtcNow;
                    page.Directory = dir;
                    page.MarkupType = MarkupType.Html;
                    var defaultPage = System.IO.Path.Combine(this.env.ContentRootPath, "Default Pages", "Blank Page.html");
                    var htmlData = await System.IO.File.ReadAllBytesAsync(defaultPage);
                    page.PageMarkup.HtmlText = Encoding.Default.GetString(htmlData);
                    await coreDataContext.SaveChangesAsync();
                    return SuccessResult();
                }
                else
                {
                    return ErrorResult($"{dto.Name} already exists in folder {dir.Name}");
                }
            }
            else
            {
                var xe = new Exception("No parent directory available");
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("update/page")]
        public async Task<IActionResult> UpdatePage()
        {
            var dto = Request.FromBody<PageDTO>();
            var page = await coreDataContext.Pages.FindAsync(dto.Id);
            if(page != null)
            {
                page.Name = dto.Name;
                if(dto.LandingPage && !page.IsLandingPage)
                {
                    // changing this page to be the landing page
                    var existingLandingPage = page.Directory.Pages.Where(p => p != page).SingleOrDefault(p => p.IsLandingPage);
                    if(existingLandingPage != null)
                    {
                        existingLandingPage.IsLandingPage = false;
                        await coreDataContext.RecordChanges(existingLandingPage, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.PageModified, page.Directory);
                    }
                    page.IsLandingPage = true;
                }
                else if (!dto.LandingPage && page.IsLandingPage)
                {
                    // changing this page to not be the landing page
                    if (page.Directory.ParentDirectory == null)
                    {
                        // this is not allowed in the root directory
                        //change some other page to be a landing page
                        return ErrorResult($"Change is not allowed in this folder. Make some other page the landing page instead.");
                    }
                    else
                    {
                        page.IsLandingPage = false;
                    }
                }
                await coreDataContext.RecordChanges(page, GetCurrentMember().Fullname, EditingAction.EditingActionTypes.PageModified, page.Directory);
                await coreDataContext.SaveChangesAsync();
                return SuccessResult();
            }
            else
            {
                var xe = new Exception("page not found");
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
        [HttpPost("delete/document/{docId}/{dirId}")]
        public async Task<IActionResult> DeleteDocument(long docId, long dirId)
        {
            var dir = await coreDataContext.Directories.FindAsync(dirId);
            if (dir != null)
            {
                var doc = await coreDataContext.Documents.FindAsync(docId);
                if(doc.DirectoryId == dirId)
                {
                    await DeleteDocument(doc, dir);
                    await coreDataContext.SaveChangesAsync();
                    return SuccessResult();
                }
                else
                {
                    var xe = new Exception($"Directory mismatch");
                    log.Error(xe);
                    return ExceptionResult(xe);
                }
            }
            else
            {
                var xe = new Exception($"Directory id {dirId} not found");
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("delete/image/{imageId}/{dirId}")]
        public async Task<IActionResult> DeleteImage(long imageId, long dirId)
        {
            var dir = await coreDataContext.Directories.FindAsync(dirId);
            if (dir != null)
            {
                var image = await coreDataContext.Images.FindAsync(imageId);
                if (image.Directory_DirectoryId == dirId)
                {
                    await DeleteImage(image, dir);
                    await coreDataContext.SaveChangesAsync();
                    return SuccessResult();
                }
                else
                {
                    var xe = new Exception($"Directory mismatch");
                    log.Error(xe);
                    return ExceptionResult(xe);
                }
            }
            else
            {
                var xe = new Exception($"Directory id {dirId} not found");
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("delete/page/{pageId}/{dirId}")]
        public async Task<IActionResult> DeletePage(long pageId, long dirId)
        {
            var dir = await coreDataContext.Directories.FindAsync(dirId);
            if (dir != null)
            {
                var page = await coreDataContext.Pages.FindAsync(pageId);
                if (page.DirectoryId == dirId)
                {
                    await DeletePage(page, dir);
                    await coreDataContext.SaveChangesAsync();
                    return SuccessResult();
                }
                else
                {
                    var xe = new Exception($"Directory mismatch");
                    log.Error(xe);
                    return ExceptionResult(xe);
                }
            }
            else
            {
                var xe = new Exception($"Directory id {dirId} not found");
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("upload/chunk")]
        public async Task<IActionResult> UploadChunk()
        {
            //await Task.Delay(5);
            var dto = Request.FromBody<UploadDataDTO>();
            //var directory = await coreDataContext.Directories.FindAsync(dto.DirectoryId);
            //if(ItemExists(directory, dto.Filename))
            //{
            //    return ErrorResult($"{dto.Filename} already exists in {directory.Name}");
            //}
            //log.Information($"Recd chunk {dto.ChunkNumber} length {dto.Base64Data.Length} using key {dto.Key}, is last = {dto.IsLastChunk}");
            var key = dto.ChunkNumber == 0 ? Guid.NewGuid().ToString() : dto.Key;
            //ValidateChunk(dto.ChunkNumber, dto.Base64Data);
            UploadFile ulf = null;
            if (dto.ChunkNumber == 0)
            {

                ulf = new UploadFile
                {
                    Name = dto.Filename,
                    MimeType = dto.MimeType,
                    DirectoryId = dto.DirectoryId,
                    Guid = key
                };
                await coreDataContext.UploadFiles.AddAsync(ulf);
            }
            else
            {
                ulf = await coreDataContext.UploadFiles.SingleOrDefaultAsync(x => x.Guid == key);  
            }
            if (ulf != null)
            {
                var fc = new FileChunk
                {
                    UploadFile = ulf,
                    ChunkNumber = dto.ChunkNumber,
                    Base64String = dto.Base64Data
                };
                await coreDataContext.FileChunks.AddAsync(fc);
                await coreDataContext.SaveChangesAsync();
                if (dto.IsLastChunk)
                {
                    var directory = await coreDataContext.Directories.FindAsync(dto.DirectoryId);
                    if(directory != null)
                    {
                        StringBuilder sb = new StringBuilder();
                        var bufs = new List<byte[]>();
                        foreach (var item in ulf.FileChunks.OrderBy(x => x.ChunkNumber))
                        {
                            sb.Append(item.Base64String);
                            var data = Convert.FromBase64String(item.Base64String);
                            bufs.Add(data);
                            //ValidateChunk(item.ChunkNumber, item.Base64String);
                        }
                        var dataLength = bufs.Sum(x => x.Length);                        
                        var fileData = new byte[dataLength];
                        int offset = 0;
                        foreach(var buf in bufs)
                        {
                            Array.Copy(buf, 0, fileData, offset, buf.Length);
                            offset += buf.Length;
                        }
                        //var path = System.IO.Path.Combine(env.ContentRootPath, "data", "test.pdf");
                        //System.IO.File.WriteAllBytes(path, fileData);
                        switch(ulf.MimeType)
                        {
                            case "image/jpeg":
                            case "image/png":
                            case "image/gif":
                                await CreateImage(directory, ulf.Name, fileData, ulf.MimeType);
                                break;
                            default:
                                await CreateDocument(directory, ulf.Name, fileData, ulf.MimeType);
                                break;
                        }
                        coreDataContext.FileChunks.RemoveRange(ulf.FileChunks.ToArray());
                        coreDataContext.UploadFiles.Remove(ulf);
                        await coreDataContext.SaveChangesAsync();
                    }
                    else
                    {
                        var xe = new Exception("Cannot find directory");
                        log.Error(xe);
                        return ExceptionResult(xe);
                    }
                }
                return SuccessResult(key);
            }
            else
            {
                var xe = new Exception("Cannot find upload file record");
                log.Error(xe);
                return ExceptionResult(xe);
            }
            //D:\Filing\Correspondence\Marika OCI Renewal 2018
        }
        [HttpGet("check/exists/{id}/{name}")]
        public async Task<IActionResult> CheckContentExists(long id, string name)
        {
            var directory = await coreDataContext.Directories.FindAsync(id);
            var result = ItemExists(directory, name);
            return SuccessResult(result);
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
        private void ValidateChunk(int chunkNumber, string base64Data)
        {
            //D:\Filing\Correspondence\Marika OCI Renewal 2018\GBRL04E36M18 .pdf
            var file = @"D:\Filing\Correspondence\Marika OCI Renewal 2018\GBRL04E36M18 .pdf";
            var fileBytes = System.IO.File.ReadAllBytes(file);
            var chunk = Convert.FromBase64String(base64Data);
            var chunkSize = 1024 * 8 * 8;
            var startAt = chunkNumber * chunkSize;
            var length = (startAt + chunkSize) > fileBytes.Length ? fileBytes.Length - startAt : chunkSize;
            ReadOnlySpan<byte> srcBytes = new ReadOnlySpan<byte>(fileBytes, chunkNumber * chunkSize, length);
            var chunkBytes = new ReadOnlySpan<byte>(chunk);
            var result = srcBytes.SequenceEqual(chunkBytes);
            if (!result)
            {
                log.Information($"byte verification: chunk number {chunkNumber}, chunk bytes {chunkBytes.Length}, src bytes {srcBytes.Length}, result {result}");
            }
            //throw new NotImplementedException();
        }
        private async Task CreateDocument(Directory d, string filename, byte[] fileData, string mimetype)
        {
            var cm = this.GetCurrentMember();// DataContext.Members.Find(CurrentMemberId);

            var document = coreDataContext.CreateNewDocument();
            document.CreatedBy = cm.Fullname;
            document.CreatedOn = DateTimeOffset.UtcNow;
            document.Directory = d;
            document.Data = fileData;
            document.Extension = System.IO.Path.GetExtension(filename);
            document.Length = fileData.Length;
            document.Name = filename;
            document.MimeType = mimetype;
            await coreDataContext.Documents.AddAsync(document);
            return;
        }
        private async Task CreateImage(Directory d, string filename, byte[] fileData, string mimetype)
        {
            var cm = this.GetCurrentMember();// DataContext.Members.Find(CurrentMemberId);
            var (height, width) = GetDimensions(fileData);
            Image image = coreDataContext.CreateNewImage();
            image.CreatedBy = cm.Fullname;
            image.CreatedOn = DateTimeOffset.UtcNow;
            image.Directory = d;
            image.Data = fileData;
            image.Height = height;
            image.Width = width;
            image.Name = filename;
            switch (mimetype)
            {
                case "image/jpeg":
                    image.ImageType = ImageType.Jpeg;
                    break;
                case "image/png":
                    image.ImageType = ImageType.Png;
                    break;
                case "image/gif":
                    image.ImageType = ImageType.Gif;
                    break;
                default:
                    break;
            }
            await coreDataContext.Images.AddAsync(image);
        }
        private (int height, int width) GetDimensions(byte[] image)
        {
            using (var ms = new System.IO.MemoryStream(image))
            {
                var img = System.Drawing.Image.FromStream(ms);
                return (img.Height, img.Width);
                //return new { Height = img.Height, Width = img.Width };
            }
        }
        private bool ItemExists(Directory directory, string filename)
        {
            var names = directory.Documents.Select(x => x.Name.ToLower())
                .Union(directory.Images.Select(x => x.Name.ToLower()))
                .Union(directory.Pages.Select(x => x.Name.ToLower()));
            return names.Contains(filename.ToLower());
        }
    }
}