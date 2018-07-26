using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.BookingData2
{
    [Table("Parameters")]
    public class Parameter
    {
        [Key]
        public long ParameterId { get; set; }
        public DateTime? DateToday { get; set; }
        public bool TestMode { get; set; }
        public string BookingSecretaryEmailAddress { get; set; }
        [ForeignKey("ForwardBookingPeriod_PeriodId")]
        public Period ForwardBookingPeriod { get; set; }
        public string TermsAndConditionsUrl { get; set; }
        internal long? ForwardBookingPeriod_PeriodId { get; set; }
    }
}
