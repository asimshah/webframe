using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.BookingData2
{
    public class DWHParameter : Parameter
    {
        public string NonBMCMembers { get; set; }
        public string BMCMembers { get; set; }
        public string PrivilegedMembers { get; set; }
        public int PaymentInterval { get; set; }
        public int EntryCodeNotificationInterval { get; set; }
        public int EntryCodeBridgeInterval { get; set; }
        public int CancellationInterval { get; set; }
        public int FirstReminderInterval { get; set; }
        public int SecondReminderInterval { get; set; }
        public int ReminderSuppressionInterval { get; set; }
    }
}
