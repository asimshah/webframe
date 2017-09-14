namespace Fastnet.EventSystem
{
    //internal abstract class WebApiClient
    //{
    //    //private HttpClient client = new HttpClient();
    //    protected async Task Query(string url)
    //    {
    //        HttpResponseMessage response = await GetAsync(url);
    //        CheckForError(response);
    //        return;
    //    }
    //    protected async Task<T> Query<T>(string url)
    //    {
    //        HttpResponseMessage response = await GetAsync(url);
    //        return await ConvertResponse<T>(response);
    //    }
    //    protected async Task Put<T1>(string url, T1 item)
    //    {
    //        HttpResponseMessage response = await PutAsJson<T1>(url, item);
    //        return;
    //    }
    //    protected async Task<T2> Put<T1, T2>(string url, T1 item)
    //    {
    //        HttpResponseMessage response = await PutAsJson<T1>(url, item);
    //        return await ConvertResponse<T2>(response);
    //    }
    //    protected async Task<T2> Post<T1, T2>(string url, T1 item)
    //    {
    //        HttpResponseMessage response = await PostAsJson<T1>(url, item);
    //        return await ConvertResponse<T2>(response);
    //    }
    //    protected async Task Post<T>(string url, T item)
    //    {
    //        await PostAsJson<T>(url, item);
    //    }

    //    private async Task<HttpResponseMessage> PutAsJson<T>(string url, T item)
    //    {
    //        HttpClient client = GetHttpClient();
    //        HttpResponseMessage response = await client.PutAsJsonAsync<T>(url, item);
    //        return CheckForError(response);
    //    }
    //    protected async Task Post(string url)
    //    {
    //        HttpClient client = GetHttpClient();
    //        HttpResponseMessage response = await client.PostAsync(url, null);
    //        CheckForError(response);
    //    }
    //    private async Task<HttpResponseMessage> PostAsJson<T>(string url, T item)
    //    {
    //        try
    //        {
    //            HttpClient client = GetHttpClient();
    //            HttpResponseMessage response = await client.PostAsJsonAsync<T>(url, item);
    //            return CheckForError(response);
    //        }
    //        catch (HttpRequestException hre)
    //        {
    //            Debug.Print(hre.Message);
    //            //Debugger.Break();
    //            throw;
    //        }
    //        catch (Exception xe)
    //        {
    //            Debug.Print(xe.Message);
    //            //Debugger.Break();
    //            throw;
    //        }
    //    }
    //    private async Task<HttpResponseMessage> GetAsync(string url)
    //    {
    //        HttpClient client = GetHttpClient();
    //        HttpResponseMessage response = await client.GetAsync(url);
    //        return CheckForError(response);
    //    }
    //    private HttpResponseMessage CheckForError(HttpResponseMessage response)
    //    {
    //        if (!response.IsSuccessStatusCode)
    //        {
    //            Debug.Print("Error: {0}, {1}, {2}", response.RequestMessage.RequestUri.ToString(), response.ReasonPhrase,
    //                response.RequestMessage.Content == null ? "no content" : response.RequestMessage.Content.ToString());
    //        }
    //        return response;
    //    }
    //    private async Task<T> ConvertResponse<T>(HttpResponseMessage response)
    //    {
    //        if (typeof(T) == typeof(string))
    //        {
    //            string text = await response.Content.ReadAsStringAsync();
    //            if (text.StartsWith("\"") && text.EndsWith("\""))
    //            {
    //                text = text.Replace("\"", "");
    //            }
    //            return (T)(object)text;
    //        }
    //        else
    //        {
    //            return await response.Content.ReadAsAsync<T>();
    //        }
    //    }
    //    private HttpClient GetHttpClient()
    //    {
    //        HttpClient client = new HttpClient();

    //        client.Timeout = TimeSpan.FromMinutes(15);
    //        return client;
    //    }
    //}
    //internal class PolarisClient : WebApiClient
    //{
    //    private static string baseUrl = "";
    //    static PolarisClient()
    //    {
    //        baseUrl = ApplicationSettings.Key("PolarisUrl", "http://localhost:50783");
    //    }
    //    public async Task LogEvent(Event @event)
    //    {
    //        string url = string.Format("{0}/events/write", baseUrl);

    //        await this.Post(url, @event);
    //    }
    //}
}
