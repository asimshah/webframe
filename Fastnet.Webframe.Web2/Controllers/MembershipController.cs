using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using cd = Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.IdentityData2;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authorization;
using Fastnet.Core.Web;
using Fastnet.Core;
using System.Threading;
using System.Transactions;
using Microsoft.EntityFrameworkCore.Storage;
using System.Diagnostics;

namespace Fastnet.Webframe.Web2.Controllers
{
    [Produces("application/json")]
    [Route("membershipapi")]
    [Authorize(Roles = "Administrators")]
    public class MembershipController : BaseController
    {
        private readonly IMemberFactory memberfactory;
        private readonly MailHelper mailHelper;
        private readonly ApplicationDbContext applicationDbContext;
        private readonly CoreDataContext coreDataContext;
        private readonly CoreDataDbContextFactory coreDataDbContextFactory;
        public MembershipController(ILogger<MembershipController> logger, IHostingEnvironment env,
            MailHelper mh, IMemberFactory mch,
            UserManager<ApplicationUser> userManager, CoreDataDbContextFactory coreDataDbContextFactory,
            /*CoreDataContext coreDataContext,*/ ApplicationDbContext appDbContext) : base(logger, env, userManager/*, coreDataContext*/)
        {
            this.applicationDbContext = appDbContext;
            this.coreDataDbContextFactory = coreDataDbContextFactory;
            this.coreDataContext = this.coreDataDbContextFactory.GetWebDBContext<CoreDataContext>(this.applicationDbContext);// GetShareableCoreDataContext();
            this.memberfactory = mch;
            (this.memberfactory as MemberFactory).coreDataContext = this.coreDataContext;
            this.mailHelper = mh;

        }
        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpGet("get/member/{emailAddress}")]
        public async Task<IActionResult> GetMember(string emailAddress)
        {
            try
            {
                var m = await this.memberfactory.GetMemberAsync(emailAddress);
                return SuccessResult(m);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }
        [HttpGet("get/members/{searchtext}/{prefix?}")]
        public async Task<IActionResult> GetMembers(string searchText, bool prefix = false)
        {
            var members = await FindMembers(searchText, prefix);
            var result = memberfactory.ToDTO(members);
            //var result = members.Select(m => m.ToDTO(extraContext));
            return SuccessResult(result); // SuccessDataResult(result);
        }
        [HttpPost("create/member")]
        public async Task<IActionResult> CreateMember()
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var m = this.memberfactory.CreateNew(this.Request);
                    var user = new ApplicationUser { UserName = m.EmailAddress, Email = m.EmailAddress };
                    IdentityResult result = await this.userManager.CreateAsync(user, m.PlainPassword);
                    if (result.Succeeded)
                    {
                        m.Id = user.Id;
                        m.ActivationCode = Guid.NewGuid().ToString();
                        m.ActivationEmailSentDate = DateTime.UtcNow;
                        m.EmailAddressConfirmed = false;
                        m.CreationMethod = MemberCreationMethod.MembershipApplication;
                        await coreDataContext.RecordChanges(m, this.GetCurrentMember().Fullname, MemberAction.MemberActionTypes.New);
                        coreDataContext.Members.Add(m);
                        await coreDataContext.SaveChangesAsync();
                        await this.memberfactory.AssignGroups(m, this.GetCurrentMember().Fullname);
                        await coreDataContext.SaveChangesAsync();
                        transaction.Commit();
                        await this.mailHelper.SendAccountActivationAsync(m.EmailAddress, m.Id, m.ActivationCode);
                        log.Information($"Member {m.Fullname}, {m.EmailAddress}, created");
                        return SuccessResult(true);
                        //return SuccessDataResult(new { Success = true });
                    }
                    else
                    {
                        transaction.Rollback();
                        var descr = result.Errors.Select(x => x.Description).ToArray();
                        return ErrorResult(string.Join("|", descr)); //SuccessDataResult(new { Success = false, Errors = descr });
                    }

                }
                catch (Exception xe)
                {
                    transaction.Rollback();
                    log.Error(xe);
                    return ExceptionResult(xe);// ErrorDataResult(xe.Message, "Internal System Error");
                }
            }
        }
        [HttpPost("send/passwordResetEmail")]
        public async Task<IActionResult> SendPasswordResetRequest()
        {
            var m = await this.memberfactory.GetMemberAsync(Request);
            m.PasswordResetCode = Guid.NewGuid().ToString();
            m.PasswordResetEmailSentDate = DateTime.UtcNow;
            await mailHelper.SendPasswordResetAsync(m.EmailAddress, m.Id, m.PasswordResetCode);
            await coreDataContext.RecordChanges(m, this.GetCurrentMember().Fullname, MemberAction.MemberActionTypes.PasswordResetRequest);
            await coreDataContext.SaveChangesAsync();
            log.Information($"Member {m.Fullname}, {m.EmailAddress}, password reset email sent");
            return SuccessResult(null);
        }
        [HttpPost("send/activationEmail")]
        public async Task<IActionResult> SendActivationEmail()
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var dto = this.memberfactory.GetMemberDTO(Request);
                    var emailAddress = dto.EmailAddress;
                    var m = await this.memberfactory.GetMemberAsync(dto);
                    var user = await this.userManager.FindByEmailAsync(emailAddress);
                    m.EmailAddressConfirmed = false;
                    m.ActivationCode = Guid.NewGuid().ToString();
                    m.ActivationEmailSentDate = DateTime.UtcNow;
                    await mailHelper.SendAccountActivationAsync(m.EmailAddress, m.Id, m.ActivationCode);
                    await coreDataContext.RecordChanges(m, this.GetCurrentMember().Fullname, MemberAction.MemberActionTypes.Deactivation);
                    await this.userManager.UpdateAsync(user);
                    await coreDataContext.SaveChangesAsync();
                    transaction.Commit();
                    log.Information($"Member {m.Fullname}, {m.EmailAddress}, deactivated and activation email sent");
                    return SuccessResult(null);
                }
                catch (Exception xe)
                {
                    log.Error(xe);
                    transaction.Rollback();
                    return ExceptionResult(xe);// ErrorDataResult(xe.Message);
                }
            }
        }
        [AllowAnonymous]
        [HttpGet("validate/email/{address}")]
        public async Task<IActionResult> ValidateEmailAddress(string address)
        {
            address = address.ToLower();
            var m = await coreDataContext.Members.SingleOrDefaultAsync(x => x.EmailAddress == address);
            if (m == null)
            {
                return SuccessResult(true);// SuccessDataResult(true);
            }
            return ErrorResult("Email address is in use");// SuccessDataResult(false, "Email address is in use");
        }
        [AllowAnonymous]
        [HttpPost("validate/prop/{name}")]
        public async Task<IActionResult> ValidateProperty(string name)
        {
            //await Task.Delay(0);
            var data = this.Request.FromBody<string[]>();
            var (success, message) = await this.memberfactory.ValidateProperty(name, data);
            return success ? SuccessResult(true) : ErrorResult(message);// ( SuccessDataResult(success, message);
        }
        [HttpPost("update/member")]
        public async Task<IActionResult> UpdateMember()
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var dto = this.memberfactory.GetMemberDTO(Request);
                    var newEmailAddress = dto.EmailAddress;
                    var m = await this.memberfactory.GetMemberAsync(dto);
                    if (m != null)
                    {

                        var oldEmailAddress = m.EmailAddress;
                        var emailAddressHasChanged = string.Compare(newEmailAddress, oldEmailAddress, true) != 0;
                        await this.memberfactory.UpdateMember(m, dto, this.GetCurrentMember().Fullname);
                        if (emailAddressHasChanged)
                        {
                            var user = await this.userManager.FindByEmailAsync(oldEmailAddress);
                            user.Email = newEmailAddress;
                            user.UserName = newEmailAddress;
                            var ir = await this.userManager.UpdateAsync(user);
                            if (!ir.Succeeded)
                            {
                                var descr = ir.Errors.Select(x => x.Description).ToArray();
                                return ErrorResult(string.Join("|", descr)); //SuccessDataResult(new { Success = false, Errors = descr });
                            }
                            m.EmailAddressConfirmed = false;
                            m.ActivationCode = Guid.NewGuid().ToString();
                            m.ActivationEmailSentDate = DateTime.UtcNow;
                            m.EmailAddressConfirmed = false;
                            await mailHelper.SendEmailAddressChangedAsync(m.EmailAddress, m.Id, m.ActivationCode);
                            await coreDataContext.RecordChanges(m, this.GetCurrentMember().Fullname, MemberAction.MemberActionTypes.Deactivation);
                        }
                        await coreDataContext.SaveChangesAsync();
                        transaction.Commit();
                        log.Information($"Member {m.Fullname}, {m.EmailAddress}, updated");
                    }
                    return SuccessResult(null);// SuccessDataResult(null);

                }
                catch (Exception xe)
                {
                    log.Error(xe);
                    transaction.Rollback();
                    return ExceptionResult(xe);// ErrorDataResult(xe.Message);
                }
            }
        }
        [HttpPost("delete/member")]
        public async Task<IActionResult> DeleteMember()
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var m = await this.memberfactory.GetMemberAsync(this.Request);
                    if (m != null)
                    {

                        await RemoveMemberIdentityAsync(m.EmailAddress);
                        this.memberfactory.DeleteMember(m);
                        await coreDataContext.SaveChangesAsync();
                        transaction.Commit();
                        //log.Information($"Member {m.Fullname}, {m.EmailAddress}, deleted");
                    }
                    else
                    {
                        // we should not normally get here
                        // but just in case we do not have this member in the core db
                        // but do have it in the identity system
                        var dto = Request.FromBody<MemberDTO>();
                        await RemoveMemberIdentityAsync(dto.EmailAddress);
                    }
                    return SuccessResult(null);// SuccessDataResult(null);

                }
                catch (Exception xe)
                {
                    log.Error(xe);
                    transaction.Rollback();
                    return ExceptionResult(xe);// ErrorDataResult(xe.Message);
                }
            }
        }
        [HttpGet("activate/member/{id}")]
        public async Task<IActionResult> ActivateMember(string id)
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var user = await userManager.FindByIdAsync(id);
                    if (user != null)
                    {
                        var m = await coreDataContext.Members.SingleOrDefaultAsync(x => x.EmailAddress == user.Email);
                        if (m != null)
                        {
                            m.EmailAddressConfirmed = true;
                            m.ActivationCode = null;
                            user.EmailConfirmed = true;
                            await userManager.UpdateAsync(user);
                            await coreDataContext.SaveChangesAsync();
                            transaction.Commit();
                            log.Information($"Member {m.Fullname}, {m.EmailAddress}, activated");
                            return SuccessResult(null);
                        }
                        else
                        {
                            var e1 = new Exception($"{user.UserName} not found in main db");
                            log.Error(e1);
                            return ExceptionResult(e1);
                        }
                    }
                    else
                    {
                        var e2 = new Exception($"User id {id} not found in identity db");
                        log.Error(e2);
                        return ExceptionResult(e2);
                    }
                }
                catch (Exception xe)
                {
                    log.Error(xe);
                    transaction.Rollback();
                    return ExceptionResult(xe);// ErrorDataResult(xe.Message);
                }
            }
        }
        //[AllowAnonymous]
        [HttpGet("delete/user/{emailAddress}")]
        public async Task<IActionResult> DeleteUser(string emailAddress)
        {
            var connection = applicationDbContext.Database.GetDbConnection();
            var x = new DbContextOptionsBuilder<CoreDataContext>()
                .UseSqlServer(connection)
                .Options;
            var ctx = new CoreDataContext(x, null, null);
            await RemoveMemberIdentityAsync(emailAddress);
            return SuccessResult(null);// SuccessDataResult(null);
        }

        // now the group stuff
        //[AllowAnonymous]
        [HttpGet("get/groups/{parentId?}")]
        public async Task<IActionResult> GetGroups(long? parentId = null)
        {
            IQueryable<cd.Group> query = null;
            if (parentId.HasValue)
            {
                query = coreDataContext.Groups
                    .Include(x => x.ParentGroup)
                    .Where(x => x.ParentGroupId == parentId.Value);

            }
            else
            {
                query = coreDataContext.Groups
                    .Include(x => x.ParentGroup)
                    .Where(x => x.ParentGroup == null);
            }
            var groups = await query
                .OrderBy(x => x.Name)
                .ToArrayAsync();
            return SuccessResult(groups.Select(x => x.ToDTO()).ToArray());
        }
        [HttpGet("get/group/members/{groupId}")]
        public async Task<IActionResult> GetGroupMembers(long groupId)
        {
            var members = await coreDataContext.GroupMembers
                .Include(x => x.Member)
                .Where(x => x.GroupId == groupId)
                .Select(x => x.Member)
                .OrderBy(x => x.LastName)
                .ToArrayAsync();

            return SuccessResult(members.Select(m => m.ToDTO()));
        }
        [AllowAnonymous]
        [HttpGet("get/candidatemembers/{groupId}")]
        public async Task<IActionResult> GetCandidateMembers(long groupId)
        {
            // candidate members are ones that could be added to the group
            // so that is everyone except
            // 1 the administrator or the anonymous member
            // 2. anyone already a member of the group
            // 3. anyone who is a member of any parent group up the heirarchy
            try
            {
                coreDataContext.ChangeTracker.AutoDetectChangesEnabled = false;
                var group = await coreDataContext.Groups
                    .SingleOrDefaultAsync(x => x.GroupId == groupId);
                var membersAlreadyPresent = group.GroupMembers
                    .Select(x => x.Member)
                    .ToArray(); // have to complete this operation here because otherwise lazy loading reports a "second operation" error
                List<Member> membersInAnyParent = new List<Member>();
                foreach(var pg in group.Parents)
                {
                    if ((pg.Type & GroupTypes.SystemDefinedMembers) == 0)
                    {
                        membersInAnyParent.AddRange(pg.GroupMembers.Select(x => x.Member));
                    }
                }
                var members = coreDataContext.Members.Where(x => x.IsAdministrator == false && x.IsAnonymous == false);

                var result = members
                    .Except(membersAlreadyPresent)
                    .Except(membersInAnyParent)
                    .OrderBy(x => x.LastName)
                    .ThenBy(x => x.FirstName)
                    .Select(x => x.ToDTO())
                    .ToArray(); // to avoid doing ToDTO() as part of the return
                return SuccessResult(result);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }

        [HttpPost("add/groupmembers/{groupId}")]
        public async Task<IActionResult> AddGroupMembers(long groupId)
        {
            // when members are added to a group, they 
            // need to be removed from any child groups
            try
            {
                var group = await coreDataContext.Groups
                    .SingleOrDefaultAsync(x => x.GroupId == groupId);
                if (group != null)
                {
                    var childGroups = group.Descendants;
                    var list = Request.FromBody<MemberIdList>();
                    foreach (var id in list.Ids)
                    {
                        var m = await coreDataContext.Members.FindAsync(id);
                        if(m != null)
                        {
                            var gm = new GroupMember
                            {
                                Group = group,
                                Member = m
                            };
                            await coreDataContext.GroupMembers.AddAsync(gm);
                            await coreDataContext.RecordChanges(group, this.GetCurrentMember().Fullname, GroupAction.GroupActionTypes.MemberAddition, m);
                            log.Information($"Member {m.FirstName} {m.LastName} added to group {group.Name}");
                            foreach (var cg in group.Descendants)
                            {
                                //await coreDataContext.Entry(cg).Collection(x => x.GroupMembers).LoadAsync();
                                var childGroupsWithMember = cg.GroupMembers.Where(x => x.MemberId == m.Id).ToArray();
                                coreDataContext.GroupMembers.RemoveRange(childGroupsWithMember);
                                foreach (var item in childGroupsWithMember)
                                {
                                    await coreDataContext.RecordChanges(item.Group, this.GetCurrentMember().Fullname, GroupAction.GroupActionTypes.MemberRemoval, item.Member);
                                    log.Information($"Member {item.Member.FirstName} {item.Member.LastName} removed from group {item.Group.Name}");
                                }
                            }
                        }
                    }
                    await coreDataContext.SaveChangesAsync();
                    return SuccessResult();
                }
                else
                {
                    var ex = new Exception($"Group id {groupId}not found");
                    log.Error(ex);
                    return ExceptionResult(ex);// ErrorDataResult(xe.Message);
                }
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }
        [HttpPost("remove/groupmembers/{groupId}")]
        public async Task<IActionResult> RemoveGroupMembers(long groupId)
        {
            try
            {
                var list = Request.FromBody<MemberIdList>();
                foreach (var id in list.Ids)
                {
                    var gm = await coreDataContext.GroupMembers.FindAsync(groupId, id);
                    if (gm != null)
                    {
                        coreDataContext.GroupMembers.Remove(gm);
                        await coreDataContext.RecordChanges(gm.Group, this.GetCurrentMember().Fullname, GroupAction.GroupActionTypes.MemberRemoval, gm.Member);
                        log.Information($"Member {gm.Member.FirstName} {gm.Member.LastName} removed from group {gm.Group.Name}");
                    }
                    else
                    {
                        var ex = new Exception($"GroupMember record for {groupId}, {id} not found");
                        log.Error(ex);
                        return ExceptionResult(ex);// ErrorDataResult(xe.Message);
                    }
                }
                await coreDataContext.SaveChangesAsync();
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }
        [HttpPost("update/group")]
        public async Task<IActionResult> UpdateGroup()
        {
            try
            {
                var dto = Request.FromBody<GroupDTO>();
                var group = await coreDataContext.Groups.SingleOrDefaultAsync(x => x.GroupId == dto.GroupId);
                if (group != null)
                {
                    group.Name = dto.Name;
                    group.Description = dto.Description;
                    group.Weight = dto.Weight;
                    await coreDataContext.RecordChanges(group, this.GetCurrentMember().Fullname, GroupAction.GroupActionTypes.Modification);
                    await coreDataContext.SaveChangesAsync();
                    log.Information($"Group {group.Name} updated");
                }
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }
        [HttpPost("create/group")]
        public async Task<IActionResult> CreateGroup()
        {
            try
            {
                var dto = Request.FromBody<GroupDTO>();
                var parentGroup = await coreDataContext.Groups.SingleOrDefaultAsync(x => x.GroupId == dto.ParentGroupId);
                var group = new cd.Group
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    ParentGroup = parentGroup,
                    Type = GroupTypes.User,
                    Weight = dto.Weight
                };
                coreDataContext.Groups.Add(group);
                await coreDataContext.RecordChanges(group, this.GetCurrentMember().Fullname, GroupAction.GroupActionTypes.New);
                await coreDataContext.SaveChangesAsync();
                log.Information($"Group {group.Name} created");
                return SuccessResult(group.GroupId);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }
        [HttpPost("delete/group")]
        public async Task<IActionResult> DeleteGroup()
        {
            try
            {
                var dto = Request.FromBody<GroupDTO>();
                var group = await coreDataContext.Groups
                    .Include(x => x.GroupMembers)
                    .SingleOrDefaultAsync(x => x.GroupId == dto.GroupId);
                if (group.Type == GroupTypes.User)
                {
                    var gms = group.GroupMembers.ToArray();
                    coreDataContext.GroupMembers.RemoveRange(gms);
                    coreDataContext.Groups.Remove(group);
                    await coreDataContext.RecordChanges(group, this.GetCurrentMember().Fullname, GroupAction.GroupActionTypes.Deletion);
                    await coreDataContext.SaveChangesAsync();
                    log.Information($"Group {group.Name} deleted");
                }
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);// ErrorDataResult(xe.Message);
            }
        }
        [AllowAnonymous]
        [HttpGet("test")]
        public async Task<IActionResult> Test()
        {
            await Task.Delay(0);
            var connection = applicationDbContext.Database.GetDbConnection();
            var x = new DbContextOptionsBuilder<CoreDataContext>()
                .UseSqlServer(connection)
                .Options;
            var ctx = new CoreDataContext(x, null, null);
            Debugger.Break();
            return SuccessResult(null);// SuccessDataResult(null);
        }
        private async Task RemoveMemberIdentityAsync(string emailAddress)
        {
            var user = await this.userManager.FindByEmailAsync(emailAddress);
            if (user != null)
            {
                await this.userManager.DeleteAsync(user);
                log.Information($"user {emailAddress} identity removed");
            }
        }
        private async Task<IEnumerable<Member>> FindMembers(string searchText, bool prefix)
        {
            Func<string, string, bool> match = (fn, ln) =>
            {
                if (searchText.Contains("*"))
                {
                    while (searchText.Contains("**"))
                    {
                        searchText = searchText.Replace("**", "*");
                    }
                    searchText = searchText.Replace("*", ".*?");
                    Regex regex = new Regex(searchText);
                    return regex.IsMatch(fn) || regex.IsMatch(ln);
                }
                else if (prefix)
                {
                    if (searchText == "#" || searchText == "sharp")
                    {
                        bool result = !(fn.Length > 0 && char.IsLetter(fn, 0) || ln.Length > 0 && char.IsLetter(ln, 0));
                        return result;
                    }
                    else
                    {
                        return fn.StartsWith(searchText, StringComparison.InvariantCultureIgnoreCase) || ln.StartsWith(searchText, StringComparison.InvariantCultureIgnoreCase);
                    }
                }
                else
                {
                    string name = fn + " " + ln;
                    return name.IndexOf(searchText, StringComparison.InvariantCultureIgnoreCase) >= 0;
                }
            };
            bool currentIsAdministrator = this.GetCurrentMember().IsAdministrator;
            var temp = await coreDataContext.Members
                .Where(x => (currentIsAdministrator || x.IsAdministrator == false) && !x.IsAnonymous)
                .Select(m => new { Id = m.Id, m.FirstName, m.LastName }).ToArrayAsync();

            var selectedMembers = temp.Where(x => match(x.FirstName, x.LastName));
            var keys = selectedMembers.Select(x => x.Id);
            var resultingMembers = await coreDataContext.Members.Where(x => keys.Contains(x.Id)).OrderBy(x => x.LastName).ToArrayAsync();
            return resultingMembers;
        }

        private void DebugMemberList(IEnumerable<Member> members)
        {
            foreach (var m in members.OrderBy(x => x.LastName))
            {
                log.Information($"Member {m.FirstName}, {m.LastName}, {m.EmailAddress}");
            }
        }

    }

}