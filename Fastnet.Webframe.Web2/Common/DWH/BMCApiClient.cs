using Fastnet.Core;
using Fastnet.Webframe.Common2;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Web2
{
    //public class apiClient : IDisposable
    //{
    //    private HttpClient client;
    //    private string location;
    //    public apiClient(string url)
    //    {
    //        this.location = url;
    //        client = new HttpClient();
    //    }
    //    ~apiClient()
    //    {
    //        Dispose();
    //    }
    //    protected async Task<dynamic> PostAsync<T>(string url, T data)
    //    {
    //        try
    //        {
    //            url = this.location + "/" + url;
    //            var r = await client.PostAsJsonAsync<T>(url, data);
    //            r.EnsureSuccessStatusCode();
    //            return await r.Content.ReadAsAsync<dynamic>();
    //        }
    //        catch (HttpRequestException hre)
    //        {
    //            if (hre.InnerException is WebException)
    //            {
    //                WebException we = (WebException)hre.InnerException;
    //                var message = await new StreamReader(we.Response.GetResponseStream()).ReadToEndAsync();
    //                throw new ApplicationException(string.Format("{0}: {1}", we.Status.ToString(), message), we);
    //            }
    //            throw;
    //        }
    //        catch (Exception)
    //        {
    //            throw;
    //        }
    //    }
    //    protected async Task<dynamic> GetAsync(string url)
    //    {
    //        try
    //        {
    //            url = this.location + "/" + url;
    //            var r = await client.GetAsync(url);
    //            r.EnsureSuccessStatusCode();
    //            return await r.Content.ReadAsAsync<dynamic>();
    //        }
    //        catch (HttpRequestException hre)
    //        {
    //            if (hre.InnerException is WebException)
    //            {
    //                WebException we = (WebException)hre.InnerException;
    //                var message = await new StreamReader(we.Response.GetResponseStream()).ReadToEndAsync();
    //                throw new ApplicationException(string.Format("{0}: {1}", we.Status.ToString(), message), we);
    //            }
    //            throw;
    //        }
    //        catch (Exception)
    //        {
    //            throw;
    //        }
    //    }
    //    public void Dispose()
    //    {
    //        if (client != null)
    //        {
    //            client.Dispose();
    //        }
    //    }
    //}

    public class BMCApiClient 
    {
        public class ApiResult
        {
            public bool Success { get; set; }
            public string Error { get; set; }
            public BMCMembershipStatus Status { get; set; }
            public DateTime Expiry { get; set; }
        }
        private HttpClient client;
        private string location;
        private string apiUser;
        private string apiKey;
        private bool enableApi;

        private readonly ILogger log;
        private readonly CustomisationOptions options;
        public BMCApiClient(ILogger<BMCApiClient> logger, IOptions<CustomisationOptions> custOptions)
        {
            this.log = logger;
            this.options = custOptions.Value;
            this.location = options.bmc.api.apiurl;
            this.apiKey = options.bmc.api.apikey;
            this.apiUser = options.bmc.api.apiuser;
            this.enableApi = options.bmc.api.enable;
        }
        public async Task<ApiResult> Validate(string bmcMembership, string lastName)
        {
            var result = new ApiResult();
            if (enableApi)
            {
                dynamic r = await ValidateInternal(bmcMembership, lastName);
                result.Success = r.Success;
                result.Status = r.Status;
                result.Error = r.Error;
                result.Expiry = r.Expiry;
            }
            else
            {
                // bmc api is off so emulate it ..
                await Task.Delay(500);
                if(bmcMembership.Length != 7 || bmcMembership.Contains("Z"))
                {
                    result.Success = false;
                    result.Error = "BMC number is not valid";
                    result.Expiry = DateTime.MinValue;
                    result.Status = BMCMembershipStatus.Error;
                }
                else
                {
                    result.Success = true;
                    result.Expiry = DateTime.Now.AddYears(1);
                    result.Status = BMCMembershipStatus.Current;
                }
            }
            return result;
        }
        private async Task<ExpandoObject> ValidateInternal(string bmcMembership, string lastName)
        {
            dynamic result = new ExpandoObject();
            result.ApiEnabled = true;
            try
            {
                string url = string.Format("MemberUpdate/QueryLight?lastName={0}&membershipNumber={1}&contentType=json&apiuser={2}&apikey={3}",
                    lastName, bmcMembership, apiUser, apiKey);
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                dynamic r = await GetAsync(url);
                if (r is JObject)
                {
                    JObject jo = r as JObject;
                    dynamic r2 = jo.Value<dynamic>();
                    if (r2 != null)
                    {
                        string m = r2.Data.Result;
                        switch (m.ToLower())
                        {
                            case "not found":
                                result.Success = false;
                                result.Error = "No record found at the BMC";
                                result.Status = BMCMembershipStatus.NotFound;
                                break;
                            case "current":
                                result.Success = true;
                                result.Expiry = r2.Data.Expiry.Value;
                                result.Error = null;
                                result.Status = BMCMembershipStatus.Current;
                                break;
                            case "expired":
                                result.Success = false;
                                result.Expiry = r2.Data.Expiry.Value;
                                result.Error = "BMC membership has expired";
                                result.Status = BMCMembershipStatus.Expired;
                                break;
                        }
                    }
                }
                else
                {
                    result.Success = false;
                    result.Error = r.Error ?? "unknown error";
                    result.Status = BMCMembershipStatus.Error;
                }
                return result;
            }

            catch (Exception xe)
            {
                log.Error(xe);
                //Log.Write(xe);
                //dynamic result = new ExpandoObject();
                result.Success = false;
                result.Error = xe.Message;
                result.Status = BMCMembershipStatus.Error;
                return result;
            }
        }
        protected async Task<dynamic> PostAsync<T>(string url, T data)
        {
            try
            {
                url = this.location + "/" + url;
                var r = await client.PostAsJsonAsync<T>(url, data);
                r.EnsureSuccessStatusCode();
                return await r.Content.ReadAsAsync<dynamic>();
            }
            catch (HttpRequestException hre)
            {
                if (hre.InnerException is WebException)
                {
                    WebException we = (WebException)hre.InnerException;
                    var message = await new StreamReader(we.Response.GetResponseStream()).ReadToEndAsync();
                    throw new ApplicationException(string.Format("{0}: {1}", we.Status.ToString(), message), we);
                }
                throw;
            }
            catch (Exception)
            {
                throw;
            }
        }
        protected async Task<dynamic> GetAsync(string url)
        {
            try
            {
                url = this.location + "/" + url;
                var r = await client.GetAsync(url);
                r.EnsureSuccessStatusCode();
                return await r.Content.ReadAsAsync<dynamic>();
            }
            catch (HttpRequestException hre)
            {
                if (hre.InnerException is WebException)
                {
                    WebException we = (WebException)hre.InnerException;
                    var message = await new StreamReader(we.Response.GetResponseStream()).ReadToEndAsync();
                    throw new ApplicationException(string.Format("{0}: {1}", we.Status.ToString(), message), we);
                }
                throw;
            }
            catch (Exception)
            {
                throw;
            }
        }
        public void Dispose()
        {
            if (client != null)
            {
                client.Dispose();
            }
        }
    }
}
