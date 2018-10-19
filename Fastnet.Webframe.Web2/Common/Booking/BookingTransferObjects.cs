using Fastnet.Core;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.CoreData2;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Fastnet.Webframe.Web2
{
    public static class bookingdtoExtensions
    {
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
                HasMultipleDays = ((int)(b.To - b.From).TotalDays + 1)> 1,// b.numberOfNights > 1,
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
                Description = b.GetAccomodationDescription(),
                MemberName = member.Fullname,
                MemberEmailAddress = member.EmailAddress,
                MemberPhoneNumber = member.PhoneNumber,
                BmcMembership = member.BMCMembership,
                Organisation = member.Organisation
        };
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
}
