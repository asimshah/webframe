using Fastnet.Core;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.CoreData2;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public static partial class dtoExtensions
    {
        public static Member CreateMember(this MemberDTO dto)
        {
            var m = new Member();
            FromMemberDTO(dto, m);
            return m;
        }
        public static MemberDTO ToDTO(this Member member)
        {
            var dto = new MemberDTO();
            ToMemberDTO(dto, member);
            return dto;
        }
        public static GroupDTO ToDTO(this Group group)
        {
            var dto = new GroupDTO
            {
                GroupId = group.GroupId,
                Description = group.Description,
                Name = group.Name,
                ParentGroupId = group.ParentGroupId,
                Weight = group.Weight,
                Type = group.Type
            };
            return dto;
        }
        public static PageDTO ToDTO(this Page page)
        {
            var dto = new PageDTO
            {
                Type = ContentType.Page,
                Id = page.PageId,
                Url = page.Url,
                Name = page.Name,
                IconUrl = page.GetIconUrl(),// page.GetTypeImageUrl(),
                PageType = page.Type,
                LandingPage = page.IsLandingPage,
                LandingPageIconUrl = "/icons/homepage.png", // Page.GetLandingPageImageUrl(),
                PageTypeTooltip = page.GetTypeTooltip(),
                CreatedBy = page.CreatedBy,
                CreatedOn = page.CreatedOn.ToUKDefaultWithTime(),
                ModifiedBy = page.ModifiedBy,
                ModifiedOn = page.ModifiedOn?.ToUKDefaultWithTime()
            };
            return dto;
        }
        public static DocumentDTO ToDTO(this Document doc)
        {
            var dto = new DocumentDTO
            {
                Type = ContentType.Document,
                Id = doc.DocumentId,
                Url = doc.Url,
                Name = doc.Name,
                IconUrl = doc.GetIconUrl()
            };
            return dto;
        }
        public static ImageDTO ToDTO(this Image image)
        {
            var dto = new ImageDTO
            {
                Type = ContentType.Image,
                Id = image.ImageId,
                Url = image.Url,
                Name = image.Name,
                IconUrl = "/icons/image.png",//image.GetImageTypeImage(),
                Size = image.Size
            };
            return dto;
        }
        public static DirectoryDTO ToDTO(this Directory dir)
        {
            return new DirectoryDTO
            {
                Id = dir.DirectoryId,
                Name = dir.ParentDirectory == null ? "Site Content" : dir.Name,
                Fullname = dir.FullName.Replace("$root", "Site Content"),
                ParentId = dir.ParentDirectoryId,
                SubdirectoryCount = dir.SubDirectories != null ? dir.SubDirectories.Count() : 0
            };
        }
        private static void FromMemberDTO(MemberDTO dto, Member member)
        {
            member.FirstName = dto.FirstName;
            member.LastName = dto.LastName;
            member.EmailAddress = dto.EmailAddress;
            member.PhoneNumber = dto.PhoneNumber;
            member.PlainPassword = dto.Password;
            member.LastLoginDate = null;
            member.CreationDate = DateTime.UtcNow;
            member.Disabled = false;
            member.IsAdministrator = false;
            member.EmailAddressConfirmed = false;
        }
        private static void ToMemberDTO(MemberDTO dto, Member member)
        {
            dto.Id = member.Id;
            dto.IsAdministrator = member.IsAdministrator;
            dto.FirstName = member.FirstName;
            dto.LastName = member.LastName;
            dto.Name = member.Fullname;
            dto.EmailAddress = member.EmailAddress;
            dto.EmailAddressConfirmed = member.EmailAddressConfirmed;
            dto.PhoneNumber = member.PhoneNumber;
            dto.CreationDate = member.CreationDate;
            dto.LastLoginDate = member.LastLoginDate;
            dto.Disabled = member.Disabled;
            dto.CreationDateFormatted = member.CreationDate.ToUKDefaultWithTime();
            dto.LastLoginDateFormatted = member.LastLoginDate?.ToUKDefaultWithTime();
        }
        private static string GetIconUrl(this Page page)
        {
            string r = null;
            switch (page.Type)
            {
                case PageType.Centre:
                    r = "/icons/centrepage.png";
                    break;
                case PageType.Left:
                    r = "/icons/leftpage.png";
                    break;
                case PageType.Right:
                    r = "/icons/rightpage.png";
                    break;
                case PageType.Banner:
                    r = "/icons/bannerpage.png";
                    break;
                default:
                    r = "/icons/panelwire.jpg";
                    break;
            }
            return r;
        }
        private static string GetIconUrl(this Document doc)
        {
            string r = null;
            switch (doc.Extension)
            {
                default:
                    r = "/icons/unknownsmall.png";
                    break;
                case ".mp3":
                    r = "/icons/audiosmall.png";
                    break;
                case ".css":
                    r = "/icons/csssmall.png";
                    break;
                case ".dotx":
                    r = "/icons/dotxsmall.png";
                    break;
                case ".xls":
                case ".xlsx":
                    r = "/icons/excelsmall.png";
                    break;
                case ".pdf":
                    r = "/icons/pdfsmall.png";
                    break;
                case ".ppt":
                case ".pptx":
                    r = "/icons/powerpointsmall.png";
                    break;
                case ".doc":
                case ".docx":
                    r = "/icons/wordsmall.png";
                    break;
                case ".mp4":
                case ".mpg":
                case ".mpeg":
                case ".avi":
                case ".flv":
                case ".mov":
                case ".wmc":
                    r = "/icons/videosmall.png";
                    break;
            }
            return r;
        }
    }
    public class UploadDataDTO
    {
        public int ChunkNumber { get; set; }
        public bool IsLastChunk { get; set; }
        public string Key { get; set; }
        public string Filename { get; set; }
        public string MimeType { get; set; }
        public long DirectoryId { get; set; }
        public string Base64Data { get; set; }
    }
    public class MemberDTO
    {
        public string Id { get; set; }
        public bool IsAdministrator { get; set; }
        public string EmailAddress { get; set; }
        public bool EmailAddressConfirmed { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool Disabled { get; set; }
        public string CreationDateFormatted { get; set; }
        public string LastLoginDateFormatted { get; set; }
    }
    public class UserCredentialsDTO
    {
        public MemberDTO Member { get; set; }
        public IEnumerable<string> Groups { get; set; }
    }
    public class GroupDTO
    {
        public long GroupId { get; set; }
        public long? ParentGroupId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Weight { get; set; }
        public GroupTypes Type { get; set; }
    }
    public class MemberIdList
    {
        public string[] Ids { get; set; }
    }
    public class DirectoryDTO
    {
        public long Id { get; set; }
        public long? ParentId { get; set; }
        public string Name { get; set; }
        public string Fullname { get; set; }
        public int SubdirectoryCount { get; set; }
    }
    public enum ContentType
    {
        Page,
        Document,
        Image
    }
    public class ContentDTO
    {
        public PageDTO[] Pages { get; set; }
        public DocumentDTO[] Documents { get; set; }
        public ImageDTO[] Images { get; set; }
    }
    public interface IContentDTO
    {
        ContentType Type { get; set; }
        long Id { get; set; }
        string Url { get; set; }
        string Name { get; set; }
        string IconUrl { get; set; }
    }
    public class PageDTO : IContentDTO
    {
        public ContentType Type { get; set; }
        public long Id { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }
        public string IconUrl { get; set; }
        public PageType PageType { get; set; }
        public bool LandingPage { get; set; }
        public string LandingPageIconUrl { get; set; }
        public string PageTypeTooltip { get; set; }
        public string ModifiedOn { get; set; }
        public string ModifiedBy { get; set; }
        public string CreatedOn { get; set; }
        public string CreatedBy { get; set; }
    }
    public class DocumentDTO : IContentDTO
    {
        public ContentType Type { get; set; }
        public long Id { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }
        public string IconUrl { get; set; }
    }
    public class ImageDTO : IContentDTO
    {
        public ContentType Type { get; set; }
        public long Id { get; set; }
        public string Url { get; set; }
        public string Name { get; set; }
        public string IconUrl { get; set; }
        public string Size { get; set; }
    }
    public class NewPageDTO
    {
        public PageType Type { get; set; }
        public long? ReferencePageId { get; set; }
        public long DirectoryId { get; set; }
        public string Name { get; set; }
    }
}
