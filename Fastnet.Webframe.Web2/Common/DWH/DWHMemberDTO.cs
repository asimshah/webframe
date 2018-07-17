using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.CoreData2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace Fastnet.Webframe.Web2
{
    public static partial class dtoExtensions
    {
        public static DWHMember CreateMember(this DWHMemberDTO dto)
        {
            var m = new DWHMember();
            FromMemberDTO(dto, m);
            m.BMCMembership = dto.BMCMembership;
            dto.Organisation = dto.Organisation;
            m.BMCMembershipIsValid = !string.IsNullOrWhiteSpace(m.BMCMembership);
            if(m.BMCMembershipIsValid)
            {
                m.BMCMembershipValidatedOn = DateTime.UtcNow;
            }
            return m;
        }
        public static DWHMemberDTO ToDTO(this DWHMember member, BookingDataContext bdb)
        {
            var dto = new DWHMemberDTO();
            ToMemberDTO(dto, member);
            dto.BMCMembership = member.BMCMembership;
            dto.Organisation = member.Organisation;
            if(bdb != null)
            {
                var bookings = bdb.Bookings.Where(x => x.MemberId == member.Id);
                dto.PastBookingCount = bookings.Count(x => x.To < DateTime.Now);
                dto.FutureBookingCount = bookings.Count(x => x.To >= DateTime.Now);
            }
            return dto;
        }
    }
    public class DWHMemberDTO : MemberDTO
    {
        public string BMCMembership { get; set; }
        public string Organisation { get; set; }
        public int PastBookingCount { get; set; }
        public int FutureBookingCount { get; set; }
    }
    public class DWHUserCredentialsDTO : UserCredentialsDTO
    {
        public new DWHMemberDTO Member { get; set; }
    }
}
