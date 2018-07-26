using Fastnet.Webframe.Common2;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.Webframe.BookingData2
{
    public class Price
    {
        [Key]
        public long PriceId { get; set; }
        [ForeignKey("Period_PeriodId")]
        public Period Period { get; set; }
        public AccomodationType Type { get; set; }
        public AccomodationClass Class { get; set; }
        public int Capacity { get; set; }
        [Required]
        public Decimal Amount { get; set; }
        internal long? Period_PeriodId { get; set; }
    }


}
