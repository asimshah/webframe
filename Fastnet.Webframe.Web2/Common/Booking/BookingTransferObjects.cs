using Fastnet.Core;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Fastnet.Webframe.Web2
{
    public enum DayStatus
    {
        IsClosed,
        IsFree,
        IsFull,
        IsPartBooked,
        IsNotBookable
    }
    public static class bookingdtoExtensions
    {
        public static PriceDTO ToDTO(this Price p)
        {
            return new PriceDTO
            {
                PriceId = p.PriceId,
                Amount = p.Amount,
                IsRolling = p.Period.PeriodType == PeriodType.Rolling,
                From = p.Period.GetStartDate(),
                FromFormatted = p.Period.GetStartDate().ToDefault(),
                To = p.Period.PeriodType != PeriodType.Rolling ? p.Period.GetEndDate() : new DateTime?(),
                ToFormatted = p.Period.PeriodType != PeriodType.Rolling ? p.Period.GetEndDate().ToDefault() : "indefinitely"
            };
        }
        public static BookingParameterDTO ToDTO(this DWHParameter p, IEnumerable<Group> availableGroups)
        {
            return new BookingParameterDTO
            {
                PaymentInterval = p.PaymentInterval,
                CancellationInterval = p.CancellationInterval,
                FirstReminderInterval = p.FirstReminderInterval,
                SecondReminderInterval = p.SecondReminderInterval,
                ReminderSuppressionInterval = p.ReminderSuppressionInterval,
                EntryCodeNotificationInterval = p.EntryCodeNotificationInterval,
                EntryCodeBridgeInterval = p.EntryCodeBridgeInterval,
                TermsAndConditionsUrl = p.TermsAndConditionsUrl,
                PaymentGatewayAvailable = false,
                Today = BookingGlobals.GetToday().ToDefault(),
                AvailableGroups = availableGroups.Select(g => g.ToDTO()).ToArray(),
                PrivilegedMembers = null, // will be set up in the client
                PrivilegedMembersGroupId = string.IsNullOrWhiteSpace(p.PrivilegedMembers) ? 0 :  availableGroups.Single(x => x.Name == p.PrivilegedMembers).GroupId
            };
        }
        public static BookingDTO ToDTO(this Booking b, DWHMember member)
        {
            return new BookingDTO
            {
                BookingId = b.BookingId,
                Reference = b.Reference,
                Status = b.Status,
                //StatusName = b.Status.ToString(),
                From = b.From.ToDefault(),
                To = b.To.ToDefault(),
                NumberOfNights = (int)(b.To - b.From).TotalDays + 1,
                HasMultipleDays = ((int)(b.To - b.From).TotalDays + 1) > 1,// b.numberOfNights > 1,
                CreatedOn = b.CreatedOn.ToDefault(),
                PartySize = b.PartySize,
                TotalCost = b.TotalCost,
                FormattedCost = string.Format("£{0:#0}", b.TotalCost),
                IsPaid = b.IsPaid,
                CanPay = (b.Status != BookingStatus.WaitingApproval && b.Status != BookingStatus.Cancelled),
                Notes = b.Notes,
                History = b.History,
                EntryInformation = b.EntryInformation,
                Under18sInParty = b.Under18sInParty,
                MemberId = b.MemberId,
                Description = null,// b.GetAccomodationDescription(),
                MemberName = member.Fullname,
                MemberEmailAddress = member.EmailAddress,
                MemberPhoneNumber = member.PhoneNumber,
                BmcMembership = member.BMCMembership,
                Organisation = member.Organisation
            };
        }
        public static DayInformationDTO ToDayInformationDTO(this Accomodation a, DateTime day, CoreDataContext core)
        {
            DayInformationDTO dto = new DayInformationDTO
            {
                Day = day,
                Hut = a.ToDTO(day)
            };
            if(dto.Hut.IsBlocked)
            {
                dto.Status = DayStatus.IsClosed;
            }
            else
            {
                var all = AllAccomodation(dto.Hut);
                int totalAvailableToBook = all.Sum(y => y.IsAvailableToBook ? 1 : 0);
                int totalBookable = all.Sum(y => y.IsBookable ? 1 : 0);
                if (totalAvailableToBook == 0)
                {
                    dto.Status = DayStatus.IsFull;
                }
                else if (totalAvailableToBook == totalBookable)
                {
                    dto.Status = DayStatus.IsFree;
                }
                else
                {
                    dto.Status = DayStatus.IsPartBooked;
                }
                if(dto.Status == DayStatus.IsFree && dto.Day.DayOfWeek == DayOfWeek.Saturday)
                {
                    dto.Status = DayStatus.IsNotBookable;
                }
                switch (dto.Status)
                {
                    case DayStatus.IsClosed:
                        dto.StatusDescription = "Don Whillans Hut  is closed on this day";
                        break;
                    case DayStatus.IsFree:
                        dto.StatusDescription = "This day free";
                        break;
                    case DayStatus.IsFull:
                        dto.StatusDescription = "This day is fully booked";
                        break;
                    case DayStatus.IsPartBooked:
                        dto.StatusDescription = "This day is part booked";
                        break;
                    case DayStatus.IsNotBookable:
                        dto.StatusDescription = "Saturdays are not separately bookable";
                        break;
                }
                foreach(var item in all)
                {
                    if(item.IsBooked)
                    {
                        var member = core.DWHMembers.Find(item.MemberId);
                        item.MemberName = member.Fullname;
                        item.MemberEmailAddress = member.EmailAddress;
                        item.MobilePhoneNumber = member.PhoneNumber;
                    }
                }
            }
            return dto;
        }
        public static AccomodationDTO ToDTO(this Accomodation a, DateTime day)
            {
            AccomodationDTO dto = new AccomodationDTO
            {
                AccomodationId = a.AccomodationId,
                Type = a.Type,
                Class = a.Class,
                Name = a.Name,
                IsBookable = a.Bookable,
                SubAccomodationSeparatelyBookable = a.SubAccomodationSeparatelyBookable,
                IsBlocked = a.Availabilities.Where(x => x.Blocked).ToArray().Any(x => x.Period.Includes(day)),
                SubAccomodation = a.SubAccomodation.Select(x => x.ToDTO(day))
            };
            var bookings = a.BookingAccomodations.Select(x => x.Booking)
                .Where(b => day >= b.From && day <= b.To); //todo: allow for cancelled bookings
            dto.IsBooked = bookings.Count() > 0;
            if (dto.IsBooked)
            {
                if (bookings.Count() > 1)
                {
                    throw new Exception($"{a.Name} booked multiple times on {day.ToDefault()}");
                }
                var booking = bookings.First();
                dto.BookingReference = booking.Reference;
                dto.MemberId = booking.MemberId;
            }
            if(!dto.IsBlocked && !dto.IsBooked)
            {
                dto.IsAvailableToBook = dto.IsBookable && !dto.AllSubAccomodation.Any(x => x.IsBooked);
                //if(dto.SubAccomodationSeparatelyBookable)
                //{

                //}
            }
            return dto;
        }
        private static IEnumerable<AccomodationDTO> AllAccomodation(AccomodationDTO hut)
        {
            List<AccomodationDTO> all = new List<AccomodationDTO>();
            all.Add(hut);
            all.AddRange(hut.AllSubAccomodation);
            return all;
        }
    }
    public class BookingDTO
    {
        public long BookingId { get; set; }
        public string Reference { get; set; }
        //public string StatusName { get; set; }
        public BookingStatus Status { get; set; }
        public string MemberId { get; set; }
        public string MemberName { get; set; }
        public string MemberEmailAddress { get; set; }
        public string MemberPhoneNumber { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Description { get; set; }
        public string CreatedOn { get; set; }
        public int PartySize { get; set; }
        public decimal TotalCost { get; set; }
        public string FormattedCost { get; set; }
        public bool IsPaid { get; set; }
        public bool CanPay { get; set; }
        public string Notes { get; set; }
        public string History { get; set; }
        public string EntryInformation { get; set; }
        public bool Under18sInParty { get; set; }
        public int NumberOfNights { get; set; }
        public bool HasMultipleDays { get; set; }
        public string BmcMembership { get; set; }
        public string Organisation { get; set; }
        // public bool MemberIsPrivileged { get; set; } need this??????
    }
    public class BookingParameterDTO
    {
        public int PaymentInterval { get; set; }
        public int CancellationInterval { get; set; }
        public int FirstReminderInterval { get; set; }
        public int SecondReminderInterval { get; set; }
        public int ReminderSuppressionInterval { get; set; }
        public int EntryCodeNotificationInterval { get; set; }
        public int EntryCodeBridgeInterval { get; set; }
        public long PrivilegedMembersGroupId { get; set; }
        public GroupDTO PrivilegedMembers { get; set; }
        public GroupDTO[] AvailableGroups { get; set; }
        public string TermsAndConditionsUrl { get; set; }
        public bool PaymentGatewayAvailable { get; set; }
        public string Today { get; set; }
    }
    public class EmailTemplateDTO
    {
        public BookingEmailTemplates Template { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
    public class PriceDTO
    {
        public long PriceId { get; set; }
        public decimal Amount { get; set; }
        public bool IsRolling { get; set; }
        public DateTime From { get; set; }
        public DateTime? To { get; set; }
        public string FromFormatted { get; internal set; }
        public string ToFormatted { get; internal set; }
    }
    public class AccomodationDTO
    {
        public long AccomodationId { get;  set; }
        public AccomodationType Type { get;  set; }
        public AccomodationClass Class { get;  set; }
        public string Name { get; set; }
        public bool IsBookable { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsAvailableToBook { get; set; }
        public bool IsBooked { get; set; }
        public bool SubAccomodationSeparatelyBookable { get; set; }
        public IEnumerable<AccomodationDTO> SubAccomodation { get; set; }
        public string BookingReference { get; set; }
        public string MemberId { get; set; }
        public string MemberName { get; set; }
        public string MemberEmailAddress { get; set; }
        public string MobilePhoneNumber { get; set; }
        public IEnumerable<AccomodationDTO> AllSubAccomodation
        {
            get
            {
                foreach(var child in SubAccomodation)
                {
                    yield return child;
                    foreach(var subchild in child.AllSubAccomodation)
                    {
                        yield return subchild;
                    }
                }
            }
        }
    }
    public class DayInformationDTO
    {
        public DateTime Day { get; set; }
        public DayStatus Status { get; set; }
        public string StatusDescription { get; set; }
        public AccomodationDTO Hut { get; set; }
    }
}
