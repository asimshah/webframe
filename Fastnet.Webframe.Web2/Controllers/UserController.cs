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
        private readonly ILogger log;
        private readonly SignInManager<ApplicationUser> signInManager;
        public UserController(IHostingEnvironment env, UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager,
            CoreDataContext coreDataContext, ILogger<UserController> logger) : base(env, userManager, coreDataContext)
        {
            this.log = logger;
            this.signInManager = signInManager;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody]Credentials credentials)
        {
            //await Task.Delay(3);
            this.log.LogInformation($"login with {credentials.emailAddress}, {credentials.password}");
            var user = await userManager.FindByEmailAsync(credentials.emailAddress);
            if(user == null)
            {
                return ErrorDataResult("InvalidCredentials");
            }
            var member = await coreDataContext.Members.FindAsync(user.Id);
            if (member.IsAdministrator || (member.EmailAddressConfirmed && !member.Disabled))
            {
                // member is activated and not disabled or is the admin
                if(IsAuthenticated)
                {
                    await signInManager.SignOutAsync();
                }
                var result = await signInManager.PasswordSignInAsync(user, credentials.password,  false, false);
                if(result.Succeeded)
                {
                    member.LastLoginDate = DateTime.UtcNow;
                    await coreDataContext.SaveChangesAsync();
                    return SuccessDataResult(null);
                }
                else
                {
                    log.LogInformation($"Member {member.EmailAddress} failed to log in.");
                    return ErrorDataResult("InvalidCredentials");
                }
            }
            else
            {
                if (!member.EmailAddressConfirmed)
                {
                    return ErrorDataResult("AccountNotActivated");
                }
                else if (member.Disabled)
                {
                    return ErrorDataResult("AccountIsBarred");
                }
            }
            return ErrorDataResult("SystemError");
        }
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            this.log.LogInformation($"logout requested");
            if (IsAuthenticated)
            {
                var user = await userManager.GetUserAsync(User);
                await signInManager.SignOutAsync();
                await userManager.UpdateSecurityStampAsync(user);
            }
            return SuccessDataResult(null);
        }
    }
}