using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.BookingData2
{
    public class BookingAccomodation
    {
        public long Booking_BookingId { get; set; }
        public long Accomodation_AccomodationId { get; set; }
        public virtual Booking Booking { get; set; }
        public virtual Accomodation Accomodation { get; set; }
    }
}
