using System.Collections.Generic;
using Fastnet.Webframe.Common2;
using Newtonsoft.Json;

namespace Fastnet.Webframe.Web2
{
    public class ClientCustomisation
    {
        public FactoryName factory { get; set; }
        public IEnumerable<RouteRedirection> routeRedirections { get; set; }
        public ClientCustomisation()
        {
            factory = FactoryName.None;
            routeRedirections = new List<RouteRedirection>();
        }
        public string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}