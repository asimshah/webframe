//using Fastnet.Common;
//using Fastnet.EventSystem;
//using Fastnet.Webframe.BookingData;
using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Webframe.BookingData2;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    //public class BMCApiClient : WebApiClient
    //{
    //    private string BMCApiUser;
    //    private string BMCApiKey;

    //    internal BMCApiClient(string url, string BMCApiUser, string BMCApiKey) : base(url)
    //    {
    //        this.BMCApiUser = BMCApiUser;
    //        this.BMCApiKey = BMCApiKey;
    //    }
    //    public async Task<ExpandoObject> Validate(string bmcMembership, string lastName)
    //    {
    //        dynamic result = new ExpandoObject();
    //        result.ApiEnabled = true;
    //        try
    //        {
    //            string url = string.Format("MemberUpdate/QueryLight?lastName={0}&membershipNumber={1}&contentType=json&apiuser={2}&apikey={3}",
    //                lastName, bmcMembership, BMCApiUser, BMCApiKey);
    //            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
    //            dynamic r = await GetAsync(url);
    //            if (r is JObject)
    //            {
    //                JObject jo = r as JObject;
    //                dynamic r2 = jo.Value<dynamic>();
    //                if (r2 != null)
    //                {
    //                    string m = r2.Data.Result;
    //                    switch (m.ToLower())
    //                    {
    //                        case "not found":
    //                            result.Success = false;
    //                            result.Error = "No record found at the BMC";
    //                            result.Status = BMCMembershipStatus.NotFound;
    //                            break;
    //                        case "current":
    //                            result.Success = true;
    //                            result.Expiry = r2.Data.Expiry.Value;
    //                            result.Error = null;
    //                            result.Status = BMCMembershipStatus.Current;
    //                            break;
    //                        case "expired":
    //                            result.Success = false;
    //                            result.Expiry = r2.Data.Expiry.Value;
    //                            result.Error = "BMC membership has expired";
    //                            result.Status = BMCMembershipStatus.Expired;
    //                            break;
    //                    }
    //                }
    //            }
    //            else
    //            {
    //                result.Success = false;
    //                result.Error = r.Error ?? "unknown error";
    //                result.Status = BMCMembershipStatus.Error;
    //            }
    //            return result;
    //        }

    //        catch (Exception xe)
    //        {
    //            Log.Write(xe);
    //            //dynamic result = new ExpandoObject();
    //            result.Success = false;
    //            result.Error = xe.Message;
    //            result.Status = BMCMembershipStatus.Error;
    //            return result;
    //        }
    //    }
    //}
    //class BMCApiFactory : CustomFactory
    //{
    //    public BMCApiFactory()
    //    {
    //        Debug.Assert(FactoryName == FactoryName.DonWhillansHut);
    //    }
    //    //public static BMCApiClient GetClient()
    //    //{
    //    //    string BMCApiUser = Settings.bmc.api.apiuser;
    //    //    string BMCApiKey = Settings.bmc.api.apikey;
    //    //    string BMCUrl = Settings.bmc.api.apiurl;
    //    //    return new BMCApiClient(BMCUrl, BMCApiUser, BMCApiKey);
    //    //}
    //}
    public enum BMCMembershipStatus
    {
        Current,
        Expired,
        NotFound,
        Missing,
        Unknown,
        Error
    }
    public class DWHMemberFactory : MemberFactory
    {
        private readonly BookingDataContext bookingDataContext;
        private readonly BMCApiClient bmcApi;
        public DWHMemberFactory(ILogger<DWHMemberFactory> log, IOptions<CustomisationOptions> options,
            CoreDataContext coreDataContext,BMCApiClient bmcApi,
            BookingDataContext bookingDataContext) : base(log, options/*, coreDataContext*/)
        {
            this.bookingDataContext = bookingDataContext;
            this.bmcApi = bmcApi;
        }
        public override IEnumerable<MemberDTO> ToDTO(IEnumerable<Member> members)
        {
            return members.Cast<DWHMember>().Select(x => x.ToDTO(bookingDataContext));
        }
        public override UserCredentialsDTO ToUserCredentialsDTO(Member member, IEnumerable<string> groups)
        {
            var dto = (member as DWHMember).ToDTO(bookingDataContext);
            return new DWHUserCredentialsDTO { Member = dto, Groups = groups };
        }
        public override Member CreateNew(HttpRequest request)
        {
            var dto = request.FromBody<DWHMemberDTO>();
            var m = dto.CreateMember();
            return m;
        }
        public override async Task<(bool, string)> ValidateProperty(string name, string[] data)
        {
            switch(name)
            {
                case "bmcnumber":
                    return await ValidateBMCNumber(data[0], data[1]);

            }
            return (false, "Property not supported");
        }
        public override MemberDTO GetMemberDTO(HttpRequest request)
        {
            return request.FromBody<DWHMemberDTO>();
        }
        public override async Task<Member> GetMemberAsync(MemberDTO dto)
        {
            return await coreDataContext.DWHMembers.FindAsync(dto.Id);
        }
        public override async Task<Member> GetMemberAsync(HttpRequest request)
        {
            var dto = GetMemberDTO(request);
            var m = await GetMemberAsync(dto);
            return m;
        }
        public override async Task<Member> GetMemberAsync(string emailAddress)
        {
            return await coreDataContext.DWHMembers.SingleAsync(x => string.Compare(x.EmailAddress, emailAddress, true) == 0);
        }
        public override void DeleteMember(Member m)
        {
            var dwhMember = m as DWHMember;
            var bookings = bookingDataContext.Bookings
                .Include(x => x.Emails)
                .Include(x => x.BookingAccomodations)
                .Where(x => x.MemberId == dwhMember.Id);
            var accomodations = bookings.SelectMany(x => x.BookingAccomodations);
            var emails = bookings.SelectMany(x => x.Emails);
            bookingDataContext.Emails.RemoveRange(emails);
            log.Information($"Member {m.Fullname}, {m.EmailAddress}, {emails.Count()} booking emails deleted");
            bookingDataContext.BookingAccomodations.RemoveRange(accomodations);
            log.Information($"Member {m.Fullname}, {m.EmailAddress}, {accomodations.Count()} booking details deleted");
            bookingDataContext.Bookings.RemoveRange(bookings);
            log.Information($"Member {m.Fullname}, {m.EmailAddress}, {bookings.Count()} bookings deleted");
            base.DeleteMember(m);
        }
        public override async Task UpdateMember(Member m, MemberDTO dto, string actionBy)
        {
            var dwhm = m as DWHMember;
            var dwhdto = dto as DWHMemberDTO;
            dwhm.Organisation = dwhdto.Organisation;
            dwhm.BMCMembership = dwhdto.BMCMembership;
            await base.UpdateMember(m, dto, actionBy);
        }
        //public override Member Find(CoreDataContext ctx, string id)
        //{
        //    return ctx.Members.Find(id) as DWHMember;
        //}
        public override async Task AssignGroups(Member m, string actionBy)
        {
            DWHMember member = m as DWHMember;
            await base.AssignGroups(member, actionBy);
            var para = bookingDataContext.Parameters.OfType<DWHParameter>().Single();
            string addToGroup = member.HasBmcMembership ? para.BMCMembers : para.NonBMCMembers;
            string removeFromGroup = member.HasBmcMembership ? para.NonBMCMembers : para.BMCMembers;
            Group add = coreDataContext.GetGroup(addToGroup);
            Group remove = coreDataContext.GetGroup(removeFromGroup);
            if (add.GroupMembers.Select(x => x.Member).SingleOrDefault(x => x.Id == member.Id) == null)
            {
                add.GroupMembers.Add(new GroupMember { Group = add, Member = member });
                await coreDataContext.RecordChanges(add, actionBy, GroupAction.GroupActionTypes.MemberAddition, member);
                log.Debug($"Member {member.Fullname}, {member.EmailAddress} added to group {add.Name}");
            }
            if (remove.GroupMembers.Select(x => x.Member).SingleOrDefault(x => x.Id == member.Id) != null)
            {
                var gm = remove.GroupMembers.Single(x => x.MemberId == member.Id);
                remove.GroupMembers.Remove(gm);
                await coreDataContext.RecordChanges(gm.Group, actionBy, GroupAction.GroupActionTypes.MemberRemoval, member);
                log.Debug($"Member {member.Fullname}, {member.EmailAddress} removed from group {gm.Group.Name}");
            }
        }
        //[Obsolete]
        //public string ExtractBmcMembership(dynamic data)
        //{
        //    string bmcMembership = data.bmcMembership?.Value ?? "";
        //    return bmcMembership.Trim();
        //}
        //[Obsolete]
        //public async override Task<ExpandoObject> ValidateRegistration(dynamic data)
        //{
        //    string lastName = ((string)data.lastName).Trim();
        //    string bmc = ExtractBmcMembership(data);
        //    //DateTime? dob = ExtractDob(data);
        //    return await ValidateRegistration(bmc, lastName);//, dob);
        //}
        //[Obsolete]
        //internal async Task<ExpandoObject> ValidateRegistration(string bmcMembership, string lastName)//, DateTime? dob)
        //{
        //    dynamic result = new ExpandoObject();
        //    //if (!string.IsNullOrWhiteSpace(bmcMembership))
        //    //{
        //    //    if (!BMCNumberInUse(bmcMembership))
        //    //    {
        //    //        if (EnableBMCApi) // ApplicationSettings.Key("DWH:ValidateBMCMembership", true))
        //    //        {
        //    //            dynamic r = await ValidateBMCNumber(bmcMembership, lastName);
        //    //            log.LogInformation("BMC membership validation: {1}, number {0}, success = {2}", bmcMembership, lastName, (bool)r.Success);
        //    //            return r;
        //    //        }
        //    //        else
        //    //        {
        //    //            //result.Success = true;
        //    //            result.Success = false;
        //    //            result.ApiEnabled = false;
        //    //            result.Error = "BMC validation gateway is disabled";
        //    //        }
        //    //    }
        //    //    else
        //    //    {
        //    //        result.Success = false;
        //    //        result.ApiEnabled = true;
        //    //        result.Error = "This BMC membership is already in use";
        //    //    }

        //    //}
        //    //else
        //    //{
        //    //    result.Success = true;
        //    //}
        //    return result;
        //}
        public async Task<(bool, string)> ValidateBMCNumber(string bmcMembership, string lastName)
        {
            bmcMembership = bmcMembership.ToUpper();
            if(!BMCNumberInUse(bmcMembership))
            {
                var r = await this.bmcApi.Validate(bmcMembership, lastName);
                if(r.Success)
                {
                    return (true, "");
                }
                else
                {
                    return (false, r.Error);
                }
            }
            else
            {
                return (false, "This BMC number is in use");
            }
            //if (string.Compare(bmcMembership, "6A6A6A6", true) == 0)
            //{
            //    dynamic result = new ExpandoObject();
            //    result.Success = true;
            //    result.Expiry = DateTime.Today.AddYears(1);
            //    result.Error = null;
            //    result.Status = BMCMembershipStatus.Current;
            //    //return result;
            //}
            //else
            //{
            //    //var bmcClient = BMCApiFactory.GetClient();
            //    //string url = string.Format("MemberUpdate/QueryLight?lastName={0}&membershipNumber={1}", lastName, bmcMembership);
            //    //return await bmcClient.Validate(bmcMembership, lastName);
            //    await Task.Delay(0);
            //    //return null;
            //}
            //return result;
        }
        private bool BMCNumberInUse(string bMCMembership)
        {
            return coreDataContext.Members.OfType<DWHMember>().Any(x => string.Compare(bMCMembership, x.BMCMembership, true) == 0);
        }
    }
}
