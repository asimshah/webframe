using System;
using System.Collections.Generic;
using System.Text;

namespace Fastnet.Webframe.BookingData2
{
    public class BookingAccomodation
    {
        internal long Booking_BookingId { get; set; }
        internal long Accomodation_AccomodationId { get; set; }
        public Booking Booking { get; set; }
        public Accomodation Accomodation { get; set; }
    }
}
