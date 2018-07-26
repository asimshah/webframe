using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Webframe.BookingData2
{
    public class Availability
    {
        public int AvailabilityId { get; set; }
        public string Description { get; set; }
        [ForeignKey("Accomodation_AccomodationId")]
        public Accomodation Accomodation { get; set; }
        [ForeignKey("Period_PeriodId")]
        public Period Period { get; set; }
        public bool Blocked { get; set; }
        internal long? Accomodation_AccomodationId { get; set; }
        internal long? Period_PeriodId { get; set; }
    }
}
