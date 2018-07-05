using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.CoreData2
{
    public partial class DWHMember : Member
    {
        public static void ResetAnonymous(CoreDataContext ctx)
        {
            var replacement = ctx.DWHMembers.SingleOrDefault(x => x.IsAnonymous);
            if (replacement == null)
            {
                try
                {
                    var anonymous = ctx.Members.SingleOrDefault(x => x.IsAnonymous);
                    if(anonymous != null)
                    {
                        var gmList = anonymous.GroupMembers.ToArray();
                        ctx.GroupMembers.RemoveRange(gmList);
                        ctx.Members.Remove(anonymous);
                        ctx.SaveChanges();
                    }
                    replacement = new DWHMember
                    {
                        Id = "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
                        LastName = "Anonymous",
                        CreationDate = DateTime.Now,
                        IsAnonymous = true,
                        CreationMethod = MemberCreationMethod.SystemGenerated
                    };
                    var anonymousGroup = ctx.GetSystemGroup(SystemGroups.Anonymous);
                    var gm = new GroupMember
                    {
                        Group = anonymousGroup,
                        Member = replacement
                    };
                    ctx.DWHMembers.Add(replacement);
                    ctx.GroupMembers.Add(gm);
                    ctx.SaveChanges();
                }
                catch (Exception)
                {
                    Debugger.Break();
                    //throw;
                }
            }
        }
        [MaxLength(128)]
        public string BMCMembership { get; set; }
        public DateTime? BMCMembershipExpiresOn { get; set; }
        public bool BMCMembershipIsValid { get; set; }
        public DateTime? BMCMembershipValidatedOn { get; set; }
        [MaxLength(128)]
        public string Organisation { get; set; }

        public DWHMember()
        {

        }
        public override ExpandoObject GetMemberListDetails()
        {
            dynamic details = base.GetMemberListDetails();
            details.Organisation = this.Organisation;
            details.BMCMembership = this.BMCMembership;
            //details.DateOfBirth = this.DateOfBirth?.ToString("ddMMMyyyy");
            details.PhoneNumber = this.PhoneNumber;
            return details;
        }
        //public override async Task<ExpandoObject> Update(dynamic data)
        //{
        //    string newEmailAddress = data.emailAddress;
        //    string newFirstName = data.firstName;
        //    string newLastName = data.lastName;
        //    bool newDisabled = data.isDisabled;

        //    DWHMemberFactory mf = MemberFactory.GetInstance() as DWHMemberFactory;
        //    string newBmcMembership = mf.ExtractBmcMembership(data);
        //    bool needsRevalidation = false;
        //    if (newBmcMembership != this.BMCMembership) // || newDob != this.DateOfBirth)
        //    {
        //        needsRevalidation = true;
        //    }
        //    dynamic r = new ExpandoObject();
        //    r.Success = true;
        //    if (needsRevalidation)
        //    {
        //        this.BMCMembershipIsValid = false;
        //        this.BMCMembershipValidatedOn = null;
        //        r = await mf.ValidateRegistration(data);//, newDob);
        //    }
        //    if (r.Success)
        //    {
        //        if (needsRevalidation)
        //        {
        //            this.BMCMembershipIsValid = true;
        //            this.BMCMembershipValidatedOn = DateTime.Now;
        //            mf.AssignGroups(this);
        //        }
        //        Update(newEmailAddress, newFirstName, newLastName, newDisabled);
        //        string newOrganisation = data.organisation?.Value ?? "";
        //        BMCMembership = newBmcMembership;
        //        Organisation = newOrganisation;
        //    }
        //    return r;
        //}
    }
}
