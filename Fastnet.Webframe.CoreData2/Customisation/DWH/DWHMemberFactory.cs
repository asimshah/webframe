//using Fastnet.Common;
//using Fastnet.EventSystem;
//using Fastnet.Webframe.BookingData;
using Fastnet.Webframe.Common2;
using Fastnet.Webframe.CoreData2;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.CoreData2
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
        private bool enableBMCApi;

        public bool EnableBMCApi
        {
            get
            {
                return enableBMCApi;
            }

            set
            {
                enableBMCApi = value;
            }
        }

        public DWHMemberFactory(ILogger log, IOptions<CustomisationOptions> options, CoreDataContext coreDataContext) : base(log, options, coreDataContext)
        {
            EnableBMCApi = this.options.bmc.api.enable;// Settings.bmc.api.enable;
        }
        protected override Member CreateMemberInstance()
        {
            return new DWHMember();
        }
        public override Member CreateNew(string id, dynamic data, object additionalData)
        {
            dynamic vr = additionalData;
            DWHMember m = CreateMemberInstance() as DWHMember;
            string emailAddress = data.emailAddress;
            string firstName = data.firstName;
            string lastName = data.lastName;
            Fill(m, id, emailAddress, firstName, lastName);
            m.BMCMembership = ExtractBmcMembership(data);// bmc.Trim();
            m.Organisation = data.organisation?.Value ?? "";
            if (vr.Success && !string.IsNullOrWhiteSpace(m.BMCMembership))
            {
                m.BMCMembershipIsValid = true;
                m.BMCMembershipValidatedOn = DateTime.Now;
            }
            return m;
        }
        public override Member Find(CoreDataContext ctx, string id)
        {
            return ctx.Members.Find(id) as DWHMember;
        }
        public override void AssignGroups(Member m)
        {
            //string addToGroup = null;
            //string removeFromGroup = null;
            //DWHMember member = m as DWHMember;
            //base.AssignGroups(member);
            //using (var bctx = new BookingDataContext())
            //{
            //    var para = bctx.Parameters.OfType<DWHParameter>().Single();
            //    addToGroup = member.BMCMembershipIsValid ? para.BMCMembers : para.NonBMCMembers;
            //    removeFromGroup = member.BMCMembershipIsValid ? para.NonBMCMembers : para.BMCMembers;
            //}
            //Group add = Group.GetGroup(addToGroup);
            //Group remove = Group.GetGroup(removeFromGroup);
            //if (add.Members.SingleOrDefault(x => x.Id == member.Id) == null)
            //{
            //    add.Members.Add(member);
            //}
            //if (remove.Members.SingleOrDefault(x => x.Id == member.Id) != null)
            //{
            //    remove.Members.Remove(member);
            //}
        }
        public string ExtractBmcMembership(dynamic data)
        {
            string bmcMembership = data.bmcMembership?.Value ?? "";
            return bmcMembership.Trim();
        }

        public async override Task<ExpandoObject> ValidateRegistration(dynamic data)
        {
            string lastName = ((string)data.lastName).Trim();
            string bmc = ExtractBmcMembership(data);
            //DateTime? dob = ExtractDob(data);
            return await ValidateRegistration(bmc, lastName);//, dob);
        }
        internal async Task<ExpandoObject> ValidateRegistration(string bmcMembership, string lastName)//, DateTime? dob)
        {
            dynamic result = new ExpandoObject();
            if (!string.IsNullOrWhiteSpace(bmcMembership))
            {
                if (!BMCNumberInUse(bmcMembership))
                {
                    if (EnableBMCApi) // ApplicationSettings.Key("DWH:ValidateBMCMembership", true))
                    {
                        dynamic r = await ValidateBMCNumber(bmcMembership, lastName);
                        log.LogInformation("BMC membership validation: {1}, number {0}, success = {2}", bmcMembership, lastName, (bool)r.Success);
                        return r;
                    }
                    else
                    {
                        //result.Success = true;
                        result.Success = false;
                        result.ApiEnabled = false;
                        result.Error = "BMC validation gateway is disabled";
                    }
                }
                else
                {
                    result.Success = false;
                    result.ApiEnabled = true;
                    result.Error = "This BMC membership is already in use";
                }

            }
            else
            {
                result.Success = true;
            }
            return result;
        }
        public async Task<ExpandoObject> ValidateBMCNumber(string bmcMembership, string lastName)
        {
            if (string.Compare(bmcMembership, "6A6A6A6", true) == 0)
            {
                dynamic result = new ExpandoObject();
                result.Success = true;
                result.Expiry = DateTime.Today.AddYears(1);
                result.Error = null;
                result.Status = BMCMembershipStatus.Current;
                return result;
            }
            else
            {
                //var bmcClient = BMCApiFactory.GetClient();
                //string url = string.Format("MemberUpdate/QueryLight?lastName={0}&membershipNumber={1}", lastName, bmcMembership);
                //return await bmcClient.Validate(bmcMembership, lastName);
                await Task.Delay(0);
                return null;
            }
        }
        private bool BMCNumberInUse(string bMCMembership)
        {
            //var ctx = Core.GetDataContext();
            return coreDataContext.Members.OfType<DWHMember>().Any(x => string.Compare(bMCMembership, x.BMCMembership, true) == 0);
        }
    }
}
