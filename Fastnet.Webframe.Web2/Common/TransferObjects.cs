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
            dto.EmailAddress = member.EmailAddress;
            dto.EmailAddressConfirmed = member.EmailAddressConfirmed;
            dto.PhoneNumber = member.PhoneNumber;
            dto.CreationDate = member.CreationDate;
            dto.LastLoginDate = member.LastLoginDate;
            dto.Disabled = member.Disabled;
            dto.CreationDateFormatted = member.CreationDate.ToUKDefaultWithTime();
            dto.LastLoginDateFormatted = member.LastLoginDate?.ToUKDefaultWithTime();
        }
    }
    public class MemberDTO
    {
        public string Id { get; set; }
        public bool IsAdministrator { get; set; }
        public string EmailAddress { get; set; }
        public bool EmailAddressConfirmed { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
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
}
