//using Fastnet.Web.Common;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
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
    }
    public class MemberFactory : IMemberFactory
    {
        protected readonly CustomisationOptions options;
        protected readonly CoreDataContext coreDataContext;
        protected readonly ILogger log;
        public MemberFactory(ILogger<MemberFactory> log, IOptions<CustomisationOptions> options, CoreDataContext coreDataContext) 
        {
            this.options = options.Value;
            this.coreDataContext = coreDataContext;
        }
        protected virtual Member CreateMemberInstance()
        {
            return new Member();
        }
        protected virtual void Fill(Member member, string id, string emailAddress, string firstName, string lastName)
        {
            member.Id = id;
            member.EmailAddress = emailAddress;
            member.FirstName = firstName;
            member.LastName = lastName;
            member.CreationDate = DateTime.UtcNow;
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
        public virtual Member CreateNew(string id, dynamic data, object additionalData)
        {
            Member member = CreateMemberInstance();

            string emailAddress = data.emailAddress;
            //string password = data.password;
            string firstName = data.firstName;
            string lastName = data.lastName;
            Fill(member, id, emailAddress, firstName, lastName);
            return member;
        }
        public virtual Member Find(CoreDataContext ctx, string id)
        {
            return ctx.Members.Find(id);// as Member;
        }
        public async virtual Task<ExpandoObject> ValidateRegistration(dynamic data)
        {
            dynamic result = new ExpandoObject();
            result.Success = true;
            result.Error = "";
            return await Task.FromResult(result);
        }
        public virtual void AssignGroups(Member member)
        {
            var allMembers = coreDataContext.GetSystemGroup(SystemGroups.AllMembers);
            if (allMembers.GroupMembers.Select(g => g.Member).SingleOrDefault(x => x.Id == member.Id) == null)
            {
                var gm = new GroupMember { Group = allMembers, Member = member };
                coreDataContext.GroupMembers.Add(gm);
                //Group.AllMembers.Members.Add(member);
            }
        }
    }
}
