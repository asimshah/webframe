using Fastnet.Webframe.CoreData2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public static partial class dtoExtensions
    {
        private static DWHMemberDTO ToDWHMemberDTO(this DWHMember member)
        {
            var dto = ToMemberDTO<DWHMemberDTO>(member);
            dto.BMCMembership = member.BMCMembership;
            dto.Organisation = member.Organisation;
            return dto;
        }
    }
    public class DWHMemberDTO : MemberDTO
    {
        public string BMCMembership { get; set; }
        public string Organisation { get; set; }
    }
}
