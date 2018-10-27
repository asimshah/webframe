using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Fastnet.Webframe.BookingData2
{
    //public static class bookingDbExtensions
    //{
    //    public static void GetDayInformation(this BookingDataContext db, DateTime day)
    //    {
    //        // accomodation is organised as a tree because of the way the DWH works: hut >> rooms >> beds
    //        // there is only one hut which contains two rooms which in turn contain the beds
    //        // Accomodation is type with children of type Accomodation, and one accomodation record
    //        // has all the available rooms/beds (as children and sub children
    //        // so we are going to get this one record and then figure out what is booked and what is availble for each day
    //        var di = new DayInformation();
    //        di.Hut = db.AccomodationSet.Single(x => x.ParentAccomodation == null /*&& x.AccomodationId == abodeId*/);
    //    }
    //}


    //public class DayInformation
    //{
    //    public DateTime Day { get; private set; }
    //    public DayStatus Status { get; set; }
    //    internal Accomodation Hut { get; set; }
    //}
}
