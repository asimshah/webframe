using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.IdentityData2;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Fastnet.Core;
using Fastnet.Core.Web;
using System.Security.Cryptography;

namespace Fastnet.Webframe.Web2.Controllers
{
    public class Credentials
    {
        public string emailAddress { get; set; }
        public string password { get; set; }
    }
    //[Produces("application/json")]
    [Route("user")]
    public class UserController : BaseController
    {
        private readonly MailHelper mailHelper;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly IMemberFactory memberfactory;
        private readonly ApplicationDbContext applicationDbContext;
        private readonly CoreDataContext coreDataContext;
        public UserController(IHostingEnvironment env, UserManager<ApplicationUser> userManager,
            MailHelper mh, IMemberFactory mch, SignInManager<ApplicationUser> signInManager,
            CoreDataDbContextFactory coreDataDbContextFactory, ApplicationDbContext appDbContext, ILogger<UserController> logger) : base(logger, env, userManager/*, coreDataContext*/)
        {
            this.applicationDbContext = appDbContext;
            this.coreDataContext = coreDataDbContextFactory.GetWebDBContext<CoreDataContext>(applicationDbContext);
            this.signInManager = signInManager;
            this.mailHelper = mh;
            this.memberfactory = mch;
            (this.memberfactory as MemberFactory).coreDataContext = this.coreDataContext;
        }
        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpGet("sync")]
        public async Task<IActionResult> Sync()
        {
            if(IsAuthenticated)
            {
                var member = this.GetCurrentMember();
                var groupNames = await GetGroupsForMember(member);
                var userData = memberfactory.ToUserCredentialsDTO(member, groupNames);
                return SuccessResult(userData);
            }
            else
            {
                return SuccessResult();
            }
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register()
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
                        m.CreationMethod = MemberCreationMethod.SelfRegistration;
                        await coreDataContext.RecordChanges(m, this.GetCurrentMember().Fullname, MemberAction.MemberActionTypes.New);
                        coreDataContext.Members.Add(m);
                        await coreDataContext.SaveChangesAsync();
                        await this.memberfactory.AssignGroups(m, this.GetCurrentMember().Fullname);
                        await coreDataContext.SaveChangesAsync();
                        transaction.Commit();
                        await this.mailHelper.SendAccountActivationAsync(m.EmailAddress, m.Id, m.ActivationCode);
                        log.Information($"Member {m.Fullname}, {m.EmailAddress}, self-registered");
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
        [HttpGet("activate/{id}/{code}")]
        public async Task<IActionResult> Activate(string id, string code)
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var member = await coreDataContext.Members.SingleOrDefaultAsync(x => x.Id == id);
                    if(member != null && member.ActivationCode == code && member.EmailAddressConfirmed == false)
                    {
                        var user = await userManager.FindByEmailAsync(member.EmailAddress);
                        member.EmailAddressConfirmed = true;
                        member.ActivationCode = null;
                        user.EmailConfirmed = true;
                        await coreDataContext.RecordChanges(member, member.Fullname, MemberAction.MemberActionTypes.Activation);
                        await userManager.UpdateAsync(user);
                        await coreDataContext.SaveChangesAsync();
                        transaction.Commit();
                        return SuccessResult();
                    }
                    else
                    {
                        transaction.Rollback();
                        return ErrorResult("Activation failed");
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
        [HttpPost("send/passwordreset")]
        public async Task<IActionResult> SendPasswordReset()
        {
            var cr = Request.FromBody<Credentials>();
            var m = await coreDataContext.Members.SingleOrDefaultAsync(x => string.Compare(x.EmailAddress, cr.emailAddress, true) == 0);
            if(m != null)
            {
                m.PasswordResetCode = Guid.NewGuid().ToString();
                m.PasswordResetEmailSentDate = DateTime.UtcNow;
                await mailHelper.SendPasswordResetAsync(m.EmailAddress, m.Id, m.PasswordResetCode);
                await coreDataContext.RecordChanges(m, m.Fullname, MemberAction.MemberActionTypes.PasswordResetRequest);
                await coreDataContext.SaveChangesAsync();
                log.Information($"Member {m.Fullname}, {m.EmailAddress}, password reset email sent");
            }
            return SuccessResult();
        }
        [HttpGet("get/member/{id}/{code}")] 
        public async Task<IActionResult> GetMember(string id, string code)
        {
            var m = await coreDataContext.Members.SingleOrDefaultAsync(x => x.Id == id && x.PasswordResetCode == code);
            if (m != null)
            {
                // for security
                m.PlainPassword = null;
                return SuccessResult(m);
            }
            else
            {
                return ErrorResult("Password reset codes are not valid");
            }
        }
        [HttpPost("change/password")]
        public async Task<IActionResult> ChangePassword()
        {
            using (var transaction = await applicationDbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    coreDataContext.Database.UseTransaction(transaction.GetDbTransaction());
                    var dto = this.memberfactory.GetMemberDTO(Request);
                    var member = await coreDataContext.Members.SingleOrDefaultAsync(x => x.Id == dto.Id);
                    var user = await applicationDbContext.Users.FindAsync(member.Id);
                    var newPassword = dto.Password;
                    user.PasswordHash = HashPassword(newPassword);
                    user.SecurityStamp = Guid.NewGuid().ToString();
                    member.PlainPassword = dto.Password;
                    await coreDataContext.RecordChanges(member, member.Fullname, MemberAction.MemberActionTypes.PasswordReset);
                    await coreDataContext.SaveChangesAsync();
                    await applicationDbContext.SaveChangesAsync();
                    transaction.Commit();
                    return SuccessResult();
                }
                catch(Exception xe)
                {
                    transaction.Rollback();
                    log.Error(xe);
                    return ExceptionResult(xe);
                }
            }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody]Credentials credentials)
        {
            //await Task.Delay(3);
            //this.log.LogInformation($"login with {credentials.emailAddress}, {credentials.password}");
            var user = await userManager.FindByEmailAsync(credentials.emailAddress);
            if(user == null)
            {
                return ErrorResult("InvalidCredentials");
            }
            var member = await coreDataContext.Members.FindAsync(user.Id);
            if (member.IsAdministrator || (member.EmailAddressConfirmed && !member.Disabled))
            {
                // member is activated and not disabled or is the admin
                if(IsAuthenticated)
                {
                    await signInManager.SignOutAsync();
                }
                var result = await signInManager.PasswordSignInAsync(user, credentials.password,  true, false);
                if(result.Succeeded)
                {
                    member.LastLoginDate = DateTime.UtcNow;
                    var groupNames = await GetGroupsForMember(member);
                    await coreDataContext.SaveChangesAsync();
                    var userData = memberfactory.ToUserCredentialsDTO(member, groupNames);
                    log.LogInformation($"Member {member.Fullname}, {member.EmailAddress} logged in.");
                    return SuccessResult(userData);
                }
                else
                {
                    log.LogInformation($"Member {member.EmailAddress} failed to log in.");
                    return ErrorResult("InvalidCredentials");
                }
            }
            else
            {
                if (!member.EmailAddressConfirmed)
                {
                    return ErrorResult("AccountNotActivated");
                }
                else if (member.Disabled)
                {
                    return ErrorResult("AccountIsBarred");
                }
            }
            return ErrorResult("SystemError");
        }
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            
            if (IsAuthenticated)
            {
                var user = await userManager.GetUserAsync(User);
                await signInManager.SignOutAsync();
                await userManager.UpdateSecurityStampAsync(user);
                this.log.LogInformation($"{user.Email} logged out");
            }
            return SuccessResult(null);
        }

        private async Task<IEnumerable<string>> GetGroupsForMember(Member m)
        {
            var groups = await coreDataContext.GetGroupsForMember(m);
            return groups.Select(x => x.Name);
        }
        public string HashPassword(string password)
        {
            byte[] salt;
            byte[] buffer2;
            if (password == null)
            {
                throw new ArgumentNullException("password");
            }
            using (Rfc2898DeriveBytes bytes = new Rfc2898DeriveBytes(password, 0x10, 0x3e8))
            {
                salt = bytes.Salt;
                buffer2 = bytes.GetBytes(0x20);
            }
            byte[] dst = new byte[0x31];
            Buffer.BlockCopy(salt, 0, dst, 1, 0x10);
            Buffer.BlockCopy(buffer2, 0, dst, 0x11, 0x20);
            return Convert.ToBase64String(dst);
        }
    }
}