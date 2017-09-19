using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.BookingData2
{
    public class BookingAccomodation
    {
        public long Booking_BookingId { get; set; }
        public long Accomodation_AccomodationId { get; set; }
        public Booking Booking { get; set; }
        public Accomodation Accomodation { get; set; }
    }
}
