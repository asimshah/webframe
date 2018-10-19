using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.CoreData2;
using Fastnet.Webframe.IdentityData2;
using Fastnet.Webframe.Web2.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Fastnet.Webframe.Web2.Controllers
{
    //[Route("api/[controller]")]
    //[ApiController]
    [Route("bookingadmin")]
    [Authorize(Roles = "Administrators")]
    public class BookingAdminController : BaseController
    {
        private readonly CoreDataContext coreDataContext;
        private readonly BookingDataContext bookingDb;
        public BookingAdminController(ILogger<BookingAdminController> logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager,
            CoreDataContext coreDataContext, BookingDataContext bookingDb ) : base(logger, env, userManager)
        {
            this.coreDataContext = coreDataContext;
            this.bookingDb = bookingDb;
        }

        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpGet("get/emailtemplate/{template}")]
        public async Task<IActionResult> GetEmailTemplate(BookingEmailTemplates template)
        {
            var et = await bookingDb.EmailTemplates.SingleOrDefaultAsync(x => x.Template == template);
            var dto = new EmailTemplateDTO { Template = template };
            if(et == null)
            {
                dto.Subject = "{{reference}}: " + string.Format("(subject line for {0})", template.ToString());
                dto.Body = string.Format(@"<div style='margin-bottom: 4px;'>No {0} email template defined</div>", template.ToString());
                dto.Body += GetKeywordBody();
            }
            else
            {
                dto.Subject = et.SubjectText;
                dto.Body = et.BodyText;
            }
            return SuccessResult(dto);
        }
        [HttpPost("save/emailtemplate")]
        public async Task<IActionResult> SaveEmailtemplate()
        {
            try
            {
                var dto = Request.FromBody<EmailTemplateDTO>();
                var et = await bookingDb.EmailTemplates.SingleAsync(x => x.Template == dto.Template);
                et.SubjectText = dto.Subject;
                et.BodyText = dto.Body;
                await bookingDb.SaveChangesAsync();
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpGet("get/emailtemplatelist")]
        public IActionResult GetEmailTemplateList()
        {
            return SuccessResult(Enum.GetNames(typeof(BookingEmailTemplates)).OrderBy(x => x));
        }
        [HttpGet("get/parameters")]
        public async Task<IActionResult> GetParameters()
        {
            var parameter = await bookingDb.DWHParameters.SingleAsync();
            var groups = await coreDataContext.Groups
                .Where(g => g.Type == GroupTypes.User)
                .ToArrayAsync();
            return SuccessResult(parameter.ToDTO(groups));
        }
        [HttpPost("save/parameters")]
        public async Task<IActionResult> SaveParameters()
        {
            try
            {
                var dto = Request.FromBody<BookingParameterDTO>();
                var parameter = await bookingDb.DWHParameters.SingleAsync();
                parameter.PaymentInterval = dto.PaymentInterval;
                parameter.CancellationInterval = dto.CancellationInterval;
                parameter.FirstReminderInterval = dto.FirstReminderInterval;
                parameter.SecondReminderInterval = dto.SecondReminderInterval;
                parameter.ReminderSuppressionInterval = dto.ReminderSuppressionInterval;
                parameter.EntryCodeNotificationInterval = dto.EntryCodeNotificationInterval;
                parameter.EntryCodeBridgeInterval = dto.EntryCodeBridgeInterval;
                parameter.TermsAndConditionsUrl = dto.TermsAndConditionsUrl;
                parameter.PrivilegedMembers = dto.PrivilegedMembers?.Name;
                await bookingDb.SaveChangesAsync();
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpGet("get/bookings/{filter?}")]
        public async Task<IActionResult> GetBookings(BookingsFilter filter = BookingsFilter.Current)
        {
            var today = BookingGlobals.GetToday();
            var bookings = bookingDb.Bookings
                .Include(x => x.BookingAccomodations)
                .AsQueryable();
            switch(filter)
            {
                case BookingsFilter.Current:
                    bookings = bookings.Where(b => b.Status != BookingStatus.Cancelled && (b.To >= today || b.IsPaid == false));
                    break;
                case BookingsFilter.UnpaidOnly:
                    bookings = bookings.Where(b => b.Status != BookingStatus.Cancelled && b.IsPaid == false);
                    break;
                case BookingsFilter.Cancelled:
                    bookings = bookings.Where(b => b.Status == BookingStatus.Cancelled);
                    break;
                case BookingsFilter.Historic:
                    bookings = bookings.Where(b => b.Status != BookingStatus.Cancelled && (b.To < today && b.IsPaid == true));
                    break;
            }
            var result = await bookings
                .OrderByDescending(b => b.To).ToArrayAsync();

            return SuccessResult(result.Select(b => b.ToDTO((DWHMember)coreDataContext.Members.Find(b.MemberId))));
        }
        private string GetKeywordBody()
        {
            string html =
            @"<div>Current key word values are:</div>
<table style='margin: 8px;'>
    <tr>
        <td>hutName</td>
        <td>{{hutName}}</td>
    </tr>
    <tr>
        <td>bookingSecretaryEmailAddress</td>
        <td>{{bookingSecretaryEmailAddress}}</td>
    </tr>
    <tr>
        <td>memberName</td>
        <td>{{memberName}}</td>
    </tr>
    <tr>
        <td>memberEmailAddress</td>
        <td>{{memberEmailAddress}}</td>
    </tr>
    <tr>
        <td>memberPhoneNumber</td>
        <td>{{memberPhoneNumber}}</td>
    </tr>
    <tr>
        <td>reference</td>
        <td>{{reference}}</td>
    </tr>
    <tr>
        <td>from</td>
        <td>{{from}}</td>
    </tr>
    <tr>
        <td>to</td>
        <td>{{to}}</td>
    </tr>
    <tr>
        <td>numberOfNights</td>
        <td>{{numberOfNights}}</td>
    </tr>
    <tr>
        <td>description</td>
        <td>{{description}}</td>
    </tr>
    <tr>
        <td>partySize</td>
        <td>{{partySize}}</td>
    </tr>
    <tr>
        <td>bookedOn</td>
        <td>{{bookedOn}}</td>
    </tr>
    <tr>
        <td>cost</td>
        <td>{{cost}}</td>
    </tr>
    <tr>
        <td>entryCode</td>
        <td>{{entryCode}}</td>
    </tr>
</table>";
            return html;
        }
    }
}