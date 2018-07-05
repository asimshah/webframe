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
        //public static MemberDTO ToDTO<T>(this T member, DbContext extraContext) where T : Member
        //{
        //    switch(member)
        //    {
        //        case DWHMember dwhm:
        //            return ToDWHMemberDTO(dwhm, extraContext as BookingDataContext);
        //        case Member m:
        //            return ToMemberDTO<MemberDTO>(m);
        //    }
        //    return null;
        //}
        //public static MemberDTO ToDTO(this Member member)
        //{
        //    return ToDTO<MemberDTO>(member);
        //}
        public static MemberDTO ToDTO(this Member member)
        {
            var dto = new MemberDTO();
            ToMemberDTO(dto, member);
            return dto;
        }

        //private static T ToMemberDTO<T>(Member member) where T : MemberDTO, new()
        //{
        //    var dto =  new T();
        //    ToMemberDTO(dto, member);
        //    return dto;
        //}
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
}
