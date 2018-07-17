﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
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

namespace Fastnet.Webframe.Web2.Controllers
{
    [Produces("application/json")]
    [Route("membershipapi")]
    [Authorize(Roles = "Administrators")]
    public class MembershipController : BaseController
    {
        private readonly IMemberFactory memberfactory;
        public MembershipController(ILogger<MembershipController> logger, IHostingEnvironment env,
            IMemberFactory mch,
            UserManager<ApplicationUser> userManager, CoreDataContext coreDataContext) : base(logger, env, userManager, coreDataContext)
        {
            this.memberfactory = mch;
        }
        [HttpGet("get/members/{searchtext}/{prefix?}")]
        public async Task<IActionResult> GetMembers(string searchText, bool prefix = false)
        {
            var members = await FindMembers(searchText, prefix);
            var result = memberfactory.ToDTO(members);
            //var result = members.Select(m => m.ToDTO(extraContext));
            return SuccessDataResult(result);
        }
        [HttpPost("create/member")]
        public async Task<IActionResult> CreateMember([FromBody] string dto)
        {
            try
            {
                var m = this.memberfactory.CreateNew(this.Request);
                var user = new ApplicationUser { UserName = m.EmailAddress, Email = m.EmailAddress };
                var result = await this.userManager.CreateAsync(user, m.PlainPassword);
                if (result.Succeeded)
                {
                    m.ActivationCode = Guid.NewGuid().ToString();
                    m.ActivationEmailSentDate = DateTime.UtcNow;
                    m.RecordChanges(this.GetCurrentMember().Fullname, MemberAction.MemberActionTypes.New);
                    coreDataContext.Members.Add(m);
                    await coreDataContext.SaveChangesAsync();
                    this.memberfactory.AssignGroups(m);
                    await coreDataContext.SaveChangesAsync();
                }
                return SuccessDataResult(null);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ErrorDataResult(xe.Message, "Internal System Error");
            }
        }
        [HttpGet("validate/email/{address}")]
        public async Task<IActionResult> ValidateEmailAddress(string address)
        {
            address = address.ToLower();
            var m = await coreDataContext.Members.SingleOrDefaultAsync(x => x.EmailAddress == address);
            if(m == null)
            {
                return SuccessDataResult(true);
            }
            return SuccessDataResult(false, "Email address is in use");
        }
        [HttpPost("validate/prop/{name}")]
        public async Task<IActionResult> ValidateProperty(string name)
        {
            //await Task.Delay(0);
            var data = this.Request.FromBody<string[]>();
            var (success, message) = await this.memberfactory.ValidateProperty(name, data);
            return SuccessDataResult(success, message);
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
            var resultingMembers =  await coreDataContext.Members.Where(x => keys.Contains(x.Id)).OrderBy(x => x.LastName).ToArrayAsync();
            return resultingMembers;
        }
    }
}