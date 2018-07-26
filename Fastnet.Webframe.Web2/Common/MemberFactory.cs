//using Fastnet.Web.Common;
using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    public interface IMemberFactory
    {
        IEnumerable<MemberDTO> ToDTO(IEnumerable<Member> members);
        UserCredentialsDTO ToUserCredentialsDTO(Member member, IEnumerable<string> groups);
        Member CreateNew(HttpRequest request);
        MemberDTO GetMemberDTO(HttpRequest request);
        Task<Member> GetMemberAsync(MemberDTO dto);
        Task<Member> GetMemberAsync(HttpRequest request);
        Task<Member> GetMemberAsync(string emailAddress);
        void DeleteMember(Member m);
        Task UpdateMember(Member m, MemberDTO dto, string actionBy);
        Task<(bool success, string message)> ValidateProperty(string name, string[] data);
        Task AssignGroups(Member m, string actionBy);
    }
    public class MemberFactory : IMemberFactory
    {
        protected readonly CustomisationOptions options;
        public CoreDataContext coreDataContext { get; set; }
        protected readonly ILogger log;
        public MemberFactory(ILogger<MemberFactory> log, IOptions<CustomisationOptions> options/*, CoreDataContext coreDataContext*/)
        {
            this.log = log;
            this.options = options.Value;
            //this.coreDataContext = coreDataContext;
        }
        public virtual IEnumerable<MemberDTO> ToDTO(IEnumerable<Member> members)
        {
            return members.Select(x => x.ToDTO());
        }
        public virtual UserCredentialsDTO ToUserCredentialsDTO(Member member, IEnumerable<string> groups)
        {
            var dto = member.ToDTO();
            return new UserCredentialsDTO { Member = dto, Groups = groups };
        }
        public virtual Member CreateNew(HttpRequest request)
        {
            var dto = request.FromBody<MemberDTO>();
            var m = dto.CreateMember();
            return m;
        }
        public virtual MemberDTO GetMemberDTO(HttpRequest request)
        {
            return request.FromBody<MemberDTO>();
        }
        public virtual async Task<Member> GetMemberAsync(HttpRequest request)
        {
            var dto = GetMemberDTO(request);// request.FromBody<MemberDTO>();
            var m = await GetMemberAsync(dto);
            return m;
        }
        public virtual async Task<Member> GetMemberAsync(MemberDTO dto)
        {
            //var dto = request.FromBody<MemberDTO>();
            return await coreDataContext.Members.FindAsync(dto.Id);
        }
        public virtual async Task<Member> GetMemberAsync(string emailAddress)
        {
            //var dto = request.FromBody<MemberDTO>();
            return await coreDataContext.Members.SingleAsync(x => string.Compare(x.EmailAddress, emailAddress, true) == 0);
        }
        public virtual void DeleteMember(Member m)
        {
            coreDataContext.Entry(m).Collection(x => x.GroupMembers).Load();
            var groups = m.GroupMembers.ToArray();
            coreDataContext.GroupMembers.RemoveRange(groups);
            coreDataContext.Members.Remove(m);
            log.Information($"Member {m.Fullname}, {m.EmailAddress}, deleted");
        }
        public virtual async Task UpdateMember(Member m, MemberDTO dto, string actionBy)
        {
            m.EmailAddress = dto.EmailAddress;
            m.FirstName = dto.FirstName;
            m.LastName = dto.LastName;
            m.Disabled = dto.Disabled;
            await AssignGroups(m, actionBy);
            await coreDataContext.RecordChanges(m, actionBy, MemberAction.MemberActionTypes.Modification);
        }
        public virtual Task<(bool, string)> ValidateProperty(string name, string[] data)
        {
            return Task.FromResult((false, "Property not supported"));
        }
        //public virtual Member Find(CoreDataContext ctx, string id)
        //{
        //    return ctx.Members.Find(id);// as Member;
        //}
        public virtual async Task AssignGroups(Member member, string actionBy)
        {
            var allMembers = coreDataContext.GetSystemGroup(SystemGroups.AllMembers);
            //coreDataContext.Entry(allMembers).Collection(x => x.GroupMembers).Load();
            if (allMembers.GroupMembers.Select(g => g.Member).SingleOrDefault(x => x.Id == member.Id) == null)
            {
                var gm = new GroupMember { Group = allMembers, Member = member };
                coreDataContext.GroupMembers.Add(gm);
                await coreDataContext.RecordChanges(allMembers, actionBy, GroupAction.GroupActionTypes.MemberAddition, member);
                log.Debug($"Member {member.Fullname}, {member.EmailAddress} added to group {gm.Group.Name}");
                //Group.AllMembers.Members.Add(member);
            }
        }

    }
}
