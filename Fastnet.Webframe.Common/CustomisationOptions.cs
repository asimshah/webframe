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

        private FactoryName _name;
        public FactoryName Factory
        {
            get
            {
                return _name;
            }
        }
        private string _factory;
        public string factory
        {
            get { return _factory; }
            set
            {
                _factory = value;
                _name = (FactoryName)Enum.Parse(typeof(FactoryName), _factory, true);
            }
        }
        public BMCOptions bmc { get; set; }
    }
}
