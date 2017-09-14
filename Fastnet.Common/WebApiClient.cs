using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Fastnet.Web.Common
{
    public class WebApiClient : IDisposable
    {
        private HttpClient client;
        private string location;
        public WebApiClient(string url)
        {
            this.location = url;
            client = new HttpClient();
        }
        ~WebApiClient()
        {
            Dispose();
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
            catch(HttpRequestException hre)
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
