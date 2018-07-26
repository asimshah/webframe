using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Webframe.Common2
{
    public enum AccomodationClass
    {
        Standard,
        Superior,
        Executive,
        Deluxe
    }
    public class CustomisationOptions
    {
        private FactoryName _name;
        private string _factory;
        public FactoryName Factory
        {
            get
            {
                return _name;
            }
        }
        public string factory
        {
            get { return _factory; }
            set
            {
                _factory = value;
                _name = (FactoryName)Enum.Parse(typeof(FactoryName), _factory, true);
            }
        }
        public int PasswordMinimumLength { get; set; } = 8;
        public bool PasswordRequireLowercase { get; set; } = false;
        public bool PasswordRequireUppercase { get; set; } = false;
        public bool PasswordRequireNonAlphanumeric { get; set; } = false;
        public bool PasswordRequireDigit { get; set; } = false;
        public bool MailEnabled { get; set; }
        public string RedirectMailTo { get; set; }
        public string MailFromAddress { get; set; }
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
        public BMCOptions bmc { get; set; }
        public BookingApp bookingApp { get; set; } = new BookingApp { enabled = false };
        public PaymentGateways paymentGateway { get; set; } = PaymentGateways.Unknown;
        public SagePay sagePay { get; set; }
    }
    public enum PaymentGateways
    {
        Unknown,
        SagePay
    }
    public class SagePay
    {
        public string liveUrl { get; set; }
        public string mockUrl { get; set; }
        public string simulatorUrl { get; set; }
        public string testUrl { get; set; }
        public string vendorName { get; set; }
    }
    public class BookingApp
    {
        public bool rollDayManually { get; set; }
        public bool enabled { get; set; }
        public bool paymentGatewayEnable { get; set; }
        public accomodationInfo[] accomodation { get; set; }
    }
    public class accomodationInfo
    {
        public string name { get; set; }
        public bool bookable { get; set; }
        public AccomodationClass accomodationClass { get; set; }
        public AccomodationType accomodationType { get; set; }
        public bool subItemsSeparatelyBookable { get; set; }
        public accomodationInfo[] subItems { get; set; }
    }
}
