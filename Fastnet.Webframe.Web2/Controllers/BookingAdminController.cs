using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
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
    [Route("bookingadmin")]
    //[Authorize(Roles = "Administrators")]
    public class BookingAdminController : BaseController
    {
        private readonly CoreDataContext coreDataContext;
        private readonly BookingDataContext bookingDb;
        public BookingAdminController(ILogger<BookingAdminController> logger, IHostingEnvironment env, UserManager<ApplicationUser> userManager,
            CoreDataContext coreDataContext, BookingDataContext bookingDb) : base(logger, env, userManager)
        {
            this.coreDataContext = coreDataContext;
            this.bookingDb = bookingDb;
        }

        protected override CoreDataContext GetCoreDataContext()
        {
            return this.coreDataContext;
        }
        [HttpGet("get/occupancy/{fromYear}/{fromMonth}/{toYear}/{toMonth}")]
        public IActionResult GetOccupancy(int fromYear, int fromMonth, int toYear, int toMonth)
        {
            try
            {
                var (Today, StartAt, Until) = GetCalendarSetupInfo();
                DateTime start = new DateTime(fromYear, fromMonth, 1);
                DateTime end = new DateTime(toYear, toMonth, DateTime.DaysInMonth(toYear, toMonth));
                //start = StartAt > start ? StartAt : start;
                //end = Until < end ? Until : end;
                //if (end < start)
                //{
                //    end = new DateTime(start.Year, start.Month, DateTime.DaysInMonth(start.Year, start.Month));
                //}
                log.Information($"occupancy from {start.ToDefault()} to {end.ToDefault()}");
                var occupancyList = new List<Occupancy>();
                GetBlockedDays(occupancyList, start, end);
                GetBookedDays(occupancyList, start, end);
                //GetNonBookableDays(occupancyList, start, end);
                var result = occupancyList.OrderBy(x => x.Day);
                log.Information($"occupancy list has {occupancyList.Count()} records");

                return SuccessResult(result);
                //var hut = bookingDb.AccomodationSet.Single(x => x.ParentAccomodation == null);
                //List<DayInformationDTO> dayList = new List<DayInformationDTO>();
                //for (DateTime day = start; day <= end; day = day.AddDays(1))
                //{
                //    var dto = hut.ToDayInformationDTO(day, coreDataContext);

                //    dayList.Add(dto);
                //}
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        public (DateTime Today, DateTime StartAt, DateTime Until) GetCalendarSetupInfo()
        {
            Parameter p = bookingDb.Parameters.Single();
            Period fp = p.ForwardBookingPeriod;
            DateTime start = BookingGlobals.GetToday().AddMonths(-12);
            DateTime end;
            switch (fp.PeriodType)
            {
                case PeriodType.Fixed:
                    if (!fp.EndDate.HasValue)
                    {
                        var xe = new ApplicationException("Fixed Forward booking period must have an end date");
                        //Log.Write(xe);
                        throw xe;
                    }
                    start = new[] { fp.StartDate.Value, start }.Max();
                    end = fp.EndDate.Value;
                    break;
                case PeriodType.Rolling:
                    end = fp.GetRollingEndDate(start);
                    break;
                default:
                    var xe2 = new ApplicationException("No valid Forward booking period available");
                    //Log.Write(xe2);
                    throw xe2;
            }
            return (BookingGlobals.GetToday(), start, end);
        }
        [HttpGet("get/prices")]
        //public IEnumerable<pricing> GetPricing(long abodeId)
        public async Task<IActionResult> GetPricing()
        {
            try
            {
                //var backDate = BookingGlobals.GetToday().AddMonths(-1);
                var bedPrices = await bookingDb.Prices.Include(x => x.Period)//.ToArray()
                                                                             //.Where(x => x.Type == AccomodationType.Bed && x.Class == AccomodationClass.Standard &&
                                                                             //     (x.Period.PeriodType == PeriodType.Rolling || x.Period.PeriodType == PeriodType.Fixed && x.Period.EndDate >= backDate))//;
                    .OrderByDescending(x => x.Period.StartDate)
                    .ToArrayAsync();
                //var temp = bedPrices.ToArray();
                var data = bedPrices
                    .ToArray()
                    .Select(x => x.ToDTO());
                return SuccessResult(data);
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("edit/price")]
        public async Task<IActionResult> EditPrice()
        {
            try
            {
                //var backDate = BookingGlobals.GetToday().AddMonths(-1);
                var dto = Request.FromBody<PriceDTO>();
                var bedPrices = await bookingDb.Prices.Include(x => x.Period)//.ToArray()
                                                                             //.Where(x => x.Type == AccomodationType.Bed && x.Class == AccomodationClass.Standard &&
                                                                             //     (x.Period.PeriodType == PeriodType.Rolling || x.Period.PeriodType == PeriodType.Fixed && x.Period.EndDate >= backDate))//;
                    .OrderBy(x => x.Period.StartDate)
                    .ToArrayAsync();
                var price = bedPrices.Single(x => x.PriceId == dto.PriceId);
                price.Period.StartDate = dto.From;
                price.Amount = dto.Amount;
                SetPricesInOrder(bedPrices);
                await bookingDb.SaveChangesAsync();
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("add/price")]
        public async Task<IActionResult> AddPricing()
        {
            // I only support a limited basic pricing:
            // a) only standard bed pricing is allowed
            // b) all prices belong to default price structure
            // c) the last price period is always rolling and this is the only rolling one
            // d) all previous price periods are fixed
            try
            {
                var dto = Request.FromBody<PriceDTO>();
                DateTime starts = dto.From;
                var amount = dto.Amount;
                var backDate = BookingGlobals.GetToday().AddMonths(-1);
                var bedPrices = await bookingDb.Prices.Include(x => x.Period)//.ToArray()
                    .Where(x => x.Type == AccomodationType.Bed && x.Class == AccomodationClass.Standard &&
                         (x.Period.PeriodType == PeriodType.Rolling || x.Period.PeriodType == PeriodType.Fixed && x.Period.EndDate >= backDate))//;
                    .OrderBy(x => x.Period.StartDate)
                    .ToListAsync();
                var existingPrice = bedPrices.SingleOrDefault(x => x.Period.StartDate == dto.From);
                if (existingPrice != null)
                {
                    existingPrice.Period.StartDate = dto.From;
                    existingPrice.Amount = dto.Amount;
                }
                else
                {
                    Period np = new Period
                    {
                        StartDate = starts,
                        PeriodType = PeriodType.Rolling,
                        EndDate = null
                    };
                    Price newPrice = new Price
                    {
                        Amount = amount,
                        Capacity = 1,
                        Class = AccomodationClass.Standard,
                        Type = AccomodationType.Bed,
                        Period = np
                    };
                    bookingDb.Periods.Add(np);
                    bookingDb.Prices.Add(newPrice);
                    bedPrices.Add(newPrice);
                }
                SetPricesInOrder(bedPrices);
                //DateTime starts = DateTime.Parse(from);
                //var lastPrice = bookingDb.Prices.Single(x => x.Period.PeriodType == PeriodType.Rolling);
                //DateTime rollsFrom = lastPrice.Period.GetStartDate();
                //if (starts == rollsFrom)
                //{
                //    // replace the amount
                //    lastPrice.Amount = amount;
                //}
                //else if (starts > rollsFrom)
                //{
                //    // make this the new last price
                //    DateTime ends = starts.AddDays(-1);
                //    lastPrice.Period.PeriodType = PeriodType.Fixed;
                //    lastPrice.Period.EndDate = ends;
                //    Period np = new Period
                //    {
                //        StartDate = starts,
                //        PeriodType = PeriodType.Rolling,
                //        EndDate = null
                //    };
                //    Price newPrice = new Price
                //    {
                //        Amount = amount,
                //        Capacity = 1,
                //        Class = AccomodationClass.Standard,
                //        Type = AccomodationType.Bed,
                //        Period = np
                //    };
                //    bookingDb.Periods.Add(np);
                //    bookingDb.Prices.Add(newPrice);
                //}
                //else
                //{
                //    var prices = bookingDb.Prices.OrderBy(x => x.Period.StartDate.Value).ToList();
                //    if (prices.Any(p => p.Period.StartDate.Value == starts))
                //    {
                //        var mp = prices.First(p => p.Period.StartDate.Value == starts);
                //        mp.Amount = amount;
                //    }
                //    else
                //    {
                //        var flp = prices.SkipWhile(p => p.Period.StartDate.Value < starts).First();

                //        Price newPrice = new Price
                //        {
                //            Amount = amount,
                //            Capacity = 1,
                //            Class = AccomodationClass.Standard,
                //            Type = AccomodationType.Bed,
                //            Period = new Period
                //            {
                //                StartDate = starts,
                //                PeriodType = PeriodType.Fixed,
                //                EndDate = flp.Period.StartDate.Value.AddDays(-1)
                //            }
                //        };
                //        bookingDb.Periods.Add(newPrice.Period);
                //        bookingDb.Prices.Add(newPrice);
                //        var index = prices.IndexOf(flp);
                //        if (index != 0)
                //        {
                //            var pp = prices[index - 1];
                //            pp.Period.EndDate = starts.AddDays(-1);
                //        }
                //    }
                //}
                await bookingDb.SaveChangesAsync();
                return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpPost("remove/price")]
        public async Task<IActionResult> RemovePricing()
        {
            try
            {
                var dto = Request.FromBody<PriceDTO>();
                var priceToDelete = bookingDb.Prices.Find(dto.PriceId);
                bookingDb.Periods.Remove(priceToDelete.Period);
                bookingDb.Prices.Remove(priceToDelete);
                var bedPrices = await bookingDb.Prices.Include(x => x.Period)
                    .ToArrayAsync(); ;
                SetPricesInOrder(bedPrices);
                await bookingDb.SaveChangesAsync();
                return SuccessResult();

                //var prices = bookingDb.Prices.OrderBy(x => x.Period.StartDate.Value).ToList();
                //if (prices.Count() > 1)
                //{
                //    var priceToDelete = bookingDb.Prices.Find(dto.PriceId);
                //    var index = prices.IndexOf(priceToDelete);
                //    if (index == 0)
                //    {
                //        // first one
                //        var np = prices[1];
                //        np.Period.StartDate = priceToDelete.Period.StartDate;
                //    }
                //    else if (index == prices.Count() - 1)
                //    {
                //        // last one
                //        var pp = prices[index - 1];
                //        pp.Period.PeriodType = PeriodType.Rolling;
                //        pp.Period.EndDate = null;
                //        //pp.Period.Description = string.Format("Range is from {0} onwards", pp.Period.StartDate.Value.ToDefault());
                //        //pp.Period.Name = "Rolling Period";
                //    }
                //    else
                //    {
                //        var np2 = prices[index - 1];
                //        np2.Period.EndDate = priceToDelete.Period.EndDate;
                //    }
                //    bookingDb.Periods.Remove(priceToDelete.Period);
                //    bookingDb.Prices.Remove(priceToDelete);
                //    await bookingDb.SaveChangesAsync();
                //}
                //return SuccessResult();
            }
            catch (Exception xe)
            {
                log.Error(xe);
                return ExceptionResult(xe);
            }
        }
        [HttpGet("get/emailtemplate/{template}")]
        public async Task<IActionResult> GetEmailTemplate(BookingEmailTemplates template)
        {
            var et = await bookingDb.EmailTemplates.SingleOrDefaultAsync(x => x.Template == template);
            var dto = new EmailTemplateDTO { Template = template };
            if (et == null)
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
            using (var ta = new TimedAction((x) =>
            {
                log.Information($"GetBookings({filter.ToString()}) completed in {x.TotalMilliseconds} millisecs");
            }))
            {

                var today = BookingGlobals.GetToday();
                var bookings = bookingDb.Bookings
                    .Include(x => x.BookingAccomodations)
                    .AsQueryable();
                switch (filter)
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
        }
        private void SetPricesInOrder(IEnumerable<Price> prices)
        {
            var ordered = prices.OrderByDescending(x => x.Period.StartDate);
            DateTime? end = null;
            var pt = PeriodType.Rolling;
            foreach (var p in ordered)
            {
                p.Period.EndDate = end;
                p.Period.PeriodType = pt;
                pt = PeriodType.Fixed;
                end = p.Period.StartDate;
            }
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
        private void GetBlockedDays(List<Occupancy> list, DateTime start, DateTime end)
        {
            var blockedPeriods = bookingDb.Availabilities.Where(x => x.Blocked);
            foreach (var bp in blockedPeriods)
            {
                var sd = new[] { start, bp.Period.StartDate.Value }.Max();
                var ed = new[] { end, bp.Period.EndDate.Value }.Min();
                Accomodation a = bp.Accomodation;
                for (DateTime d = sd; d <= ed; d = d.AddDays(1))
                {
                    var occupancy = list.SingleOrDefault(x => x.Day == d);
                    if (occupancy == null)
                    {
                        occupancy = new Occupancy { Day = d, DayFormatted = GetOccupancyDate(d), Status = DayStatus.IsClosed };
                        occupancy.Remark = bp.Description;
                        list.Add(occupancy);
                    }
                    var info = new OccupationInfo
                    {
                        AccomodationId = bp.Accomodation.AccomodationId,
                        AccomodationName = bp.Accomodation.Name
                    };
                    occupancy.OccupationList.Add(info);
                }
            }
        }
        private void GetNonBookableDays(List<Occupancy> list, DateTime start, DateTime end)
        {
            for (DateTime d = start; d <= end; d = d.AddDays(1))
            {
                if (d.DayOfWeek == DayOfWeek.Saturday)
                {
                    var occupancy = list.SingleOrDefault(x => x.Day == d);
                    if (occupancy == null)
                    {
                        occupancy = new Occupancy { Day = d, DayFormatted = GetOccupancyDate(d), Status = DayStatus.IsNotBookable };
                        list.Add(occupancy);
                    }
                }
            }
        }
        private string GetOccupancyDate(DateTime d)
        {
            return $"{d.DayOfWeek.ToString().Substring(0, 3)} " + $"{d.ToDefault()}";
        }
        private void GetBookedDays(List<Occupancy> list, DateTime start, DateTime end)
        {
            foreach (var booking in bookingDb.Bookings.Where(x => x.From >= start && x.To <= end))
            {
                var accomodationList = booking.BookingAccomodations.Select(x => x.Accomodation);
                for (DateTime d = booking.From; d <= booking.To; d = d.AddDays(1))
                {
                    DayStatus status = DayStatus.IsPartBooked;
                    if (accomodationList.Count() == 1 && accomodationList.First().Type == AccomodationType.Hut)
                    {
                        status = DayStatus.IsFull;
                    }
                    else
                    {
                        var bedcount = accomodationList.Select(x => x.Type == AccomodationType.Bed).Count();
                        if (bedcount == 12)
                        {
                            status = DayStatus.IsFull;
                        }
                        else
                        {
                            var rooms = accomodationList.Where(x => x.Type == AccomodationType.Room);
                            var beds = rooms.SelectMany(x => x.SubAccomodation);
                            if ((beds.Count() + bedcount) >= 12)
                            {
                                status = DayStatus.IsFull;
                            }
                        }
                    }
                    foreach (var a in accomodationList)
                    {
                        var occupancy = list.SingleOrDefault(x => x.Day == d);
                        if (occupancy == null)
                        {
                            occupancy = new Occupancy { Day = d, DayFormatted = GetOccupancyDate(d), Status = status };
                            list.Add(occupancy);
                        }
                        var info = new OccupationInfo
                        {
                            AccomodationId = a.AccomodationId,
                            AccomodationName = a.Name,
                            BookingId = booking.BookingId,
                            BookingReference = booking.Reference
                        };
                        occupancy.OccupationList.Add(info);
                    }

                }
            }
            foreach (var item in list)
            {
                switch (item.Status)
                {
                    case DayStatus.IsFull:
                    case DayStatus.IsPartBooked:
                        SetBookingDescription(item);
                        break;
                }
            }
        }

        private void SetBookingDescription(Occupancy item)
        {
            var bookings = item.OccupationList.Select(x => x.BookingReference)
                .Distinct()
                .OrderBy(x => x);
            foreach (var reference in bookings)
            {
                var infoList = item.OccupationList.Where(x => x.BookingReference == reference);
                var names = infoList.Select(x => x.AccomodationName).ToArray();
                item.Descriptions.Add(new BookingDescription { BookingReference = reference, Description = $"{string.Join(", ", names)}" });
            }
        }
    }
}