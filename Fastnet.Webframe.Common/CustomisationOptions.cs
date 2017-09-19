using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Common2
{
    public class CustomisationOptions
    {
        public class BMCApi
        {
            public bool enable { get; set; }
            public string apikey { get; set; }
            public string apiurl { get; set; }
            public string apiuser { get; set; }
        }
        public class BMCOptions
        {
            public BMCApi api { get; set; }
        }
        public string factory { get; set; }
        public BMCOptions bmc { get; set; }
    }
}
